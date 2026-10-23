from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import CurrentUser, get_current_user
from app.core.supabase import get_supabase_admin
from app.schemas.profile import PreferencesUpdate, ProfileUpdate


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
