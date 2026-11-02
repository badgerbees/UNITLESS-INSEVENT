from fastapi import APIRouter, Depends, HTTPException, status
from supabase_auth.errors import AuthApiError

from app.core.auth import CurrentUser, get_current_user
from app.core.supabase import get_supabase_admin, get_supabase_public
from app.schemas.profile import EmailUpdate, PasswordUpdate, PreferencesUpdate, ProfileUpdate


router = APIRouter(prefix="/me")


@router.get("")
def get_me(current_user: CurrentUser = Depends(get_current_user)) -> dict:
    result = (
        get_supabase_admin()
        .table("profiles")
        .select("id, full_name, phone, role, notif_vitamin, notif_anc, notif_emergency_sound, notif_weekly_report, created_at")
        .eq("id", current_user.id)
        .maybe_single()
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    return result.data


@router.patch("")
def update_me(
    payload: ProfileUpdate,
    current_user: CurrentUser = Depends(get_current_user),
) -> dict:
    result = (
        get_supabase_admin()
        .table("profiles")
        .update(payload.model_dump(exclude_unset=True))
        .eq("id", current_user.id)
        .select("id, full_name, phone, role, notif_vitamin, notif_anc, notif_emergency_sound, notif_weekly_report, created_at")
        .single()
        .execute()
    )
    return result.data


@router.patch("/preferences")
def update_preferences(
    payload: PreferencesUpdate,
    current_user: CurrentUser = Depends(get_current_user),
) -> dict:
    result = (
        get_supabase_admin()
        .table("profiles")
        .update(payload.model_dump(exclude_unset=True))
        .eq("id", current_user.id)
        .select("id, notif_vitamin, notif_anc, notif_emergency_sound, notif_weekly_report")
        .single()
        .execute()
    )
    return result.data


@router.patch("/email")
def update_email(
    payload: EmailUpdate,
    current_user: CurrentUser = Depends(get_current_user),
) -> dict[str, str]:
    email = payload.email.strip().lower()
    if email.count("@") != 1 or any(char.isspace() for char in email) or not all(email.split("@")):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Email tidak valid")

    try:
        result = get_supabase_admin().auth.admin.update_user_by_id(
            current_user.id,
            {"email": email},
        )
    except Exception as exc:
        message = str(exc).lower()
        if "already" in message or "registered" in message or "exists" in message:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email sudah digunakan") from exc
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Email gagal diperbarui") from exc

    updated_email = getattr(result.user, "email", None) or email
    return {"email": updated_email}


@router.post("/password")
def update_password(
    payload: PasswordUpdate,
    current_user: CurrentUser = Depends(get_current_user),
) -> dict[str, str]:
    if payload.current_password == payload.new_password:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Password baru harus berbeda")
    if not current_user.email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Akun tidak memiliki email untuk verifikasi")

    try:
        verifier = get_supabase_public()
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Konfigurasi autentikasi belum lengkap") from exc

    try:
        verified = verifier.auth.sign_in_with_password({
            "email": current_user.email,
            "password": payload.current_password,
        })
    except AuthApiError as exc:
        if exc.status == 429:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Terlalu banyak percobaan. Coba lagi nanti.") from exc
        if exc.code == "invalid_credentials":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password saat ini salah") from exc
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Verifikasi password gagal. Coba lagi.") from exc
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Verifikasi password gagal. Coba lagi.") from exc

    if verified.user is None or str(verified.user.id) != current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verifikasi akun gagal")

    try:
        get_supabase_admin().auth.admin.update_user_by_id(
            current_user.id,
            {"password": payload.new_password},
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Password gagal diperbarui") from exc

    return {"message": "Password berhasil diperbarui"}
