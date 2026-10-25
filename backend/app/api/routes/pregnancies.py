from datetime import date, timedelta
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import CurrentUser, get_current_user
from app.core.supabase import get_supabase_admin
from app.schemas.profile import PairPregnancyRequest, PregnancyCreate, PregnancyUpdate
from app.api.routes.resources import seed_default_checklist


router = APIRouter(prefix="/pregnancies")


@router.get("/current")
def get_current_pregnancy(current_user: CurrentUser = Depends(get_current_user)) -> dict:
    result = (
        get_supabase_admin()
        .table("pregnancies")
        .select("*")
        .or_(f"mother_id.eq.{current_user.id},companion_id.eq.{current_user.id}")
        .limit(1)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active pregnancy found",
        )

    return result.data[0]


@router.get("/members")
def get_pregnancy_members(current_user: CurrentUser = Depends(get_current_user)) -> dict:
    pregnancy = _find_current(current_user)
    if pregnancy is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active pregnancy found")

    ids = [pregnancy["mother_id"]]
    if pregnancy.get("companion_id"):
        ids.append(pregnancy["companion_id"])

    members = get_supabase_admin().table("profiles").select("id, full_name, phone, role").in_("id", ids).execute()
    return {"pregnancy_id": pregnancy["id"], "members": members.data}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_pregnancy(
    payload: PregnancyCreate,
    current_user: CurrentUser = Depends(get_current_user),
) -> dict:
    # Akun suami bergabung lewat kode sinkronisasi, bukan membuat kehamilan sendiri
    if _profile_role(current_user) != "mother":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only mother accounts can create a pregnancy")

    row = {
        "id": str(uuid4()),
        "mother_id": current_user.id,
        "hpht_date": payload.hpht_date.isoformat(),
        "due_date": (payload.hpht_date + timedelta(days=280)).isoformat(),
        "blood_type": payload.blood_type,
        "hospital": payload.hospital,
        "doctor": payload.doctor,
    }

    result = get_supabase_admin().table("pregnancies").insert(row).execute()
    pregnancy = result.data[0]
    seed_default_checklist(pregnancy["id"], current_user.id)
    return pregnancy


@router.patch("/current")
def update_current_pregnancy(
    payload: PregnancyUpdate,
    current_user: CurrentUser = Depends(get_current_user),
) -> dict:
    current = _find_current(current_user)
    if current is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active pregnancy found")
    if current["mother_id"] != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the mother can update pregnancy data")

    updates = payload.model_dump(exclude_unset=True, mode="json")
    if "hpht_date" in updates:
        updates["due_date"] = (payload.hpht_date + timedelta(days=280)).isoformat()
    if "postpartum_admin" in updates and updates["postpartum_admin"] is None:
        updates["postpartum_admin"] = {}

    result = (
        get_supabase_admin()
        .table("pregnancies")
        .update(updates)
        .eq("id", current["id"])
        .select("*")
        .single()
        .execute()
    )
    return result.data


@router.post("/pair")
def pair_pregnancy(
    payload: PairPregnancyRequest,
    current_user: CurrentUser = Depends(get_current_user),
) -> dict:
    if _profile_role(current_user) != "companion":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only companion accounts can pair with a pregnancy")

    supabase = get_supabase_admin()
    result = (
        supabase.table("pregnancies")
        .select("*")
        .eq("sync_code", payload.sync_code.strip().upper())
        .single()
        .execute()
    )
    pregnancy = result.data
    if not pregnancy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sync code not found")
    if pregnancy["mother_id"] == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The mother cannot pair with herself")
    if pregnancy.get("companion_id") not in (None, current_user.id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This pregnancy is already paired")

    paired = (
        supabase.table("pregnancies")
        .update({"companion_id": current_user.id})
        .eq("id", pregnancy["id"])
        .select("*")
        .single()
        .execute()
    )
    return paired.data


@router.post("/unpair")
def unpair_pregnancy(current_user: CurrentUser = Depends(get_current_user)) -> dict:
    current = _find_current(current_user)
    if current is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active pregnancy found")
    if current["companion_id"] != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the companion can unpair")

    result = (
        get_supabase_admin()
        .table("pregnancies")
        .update({"companion_id": None})
        .eq("id", current["id"])
        .select("*")
        .single()
        .execute()
    )
    return result.data


def _profile_role(current_user: CurrentUser) -> str | None:
    """Peran akun dari profiles.role, ditetapkan saat daftar ('mother' atau 'companion')."""
    result = get_supabase_admin().table("profiles").select("role").eq("id", current_user.id).limit(1).execute()
    return result.data[0]["role"] if result.data else None


def _find_current(current_user: CurrentUser) -> dict | None:
    result = (
        get_supabase_admin()
        .table("pregnancies")
        .select("*")
        .or_(f"mother_id.eq.{current_user.id},companion_id.eq.{current_user.id}")
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None
