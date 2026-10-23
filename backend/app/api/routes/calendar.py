from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import CurrentUser, get_current_user
from app.core.supabase import get_supabase_admin
from app.schemas.calendar import CalendarEventCreate, CalendarEventUpdate


router = APIRouter(prefix="/calendar")


def current_pregnancy(user: CurrentUser) -> dict:
    result = (
        get_supabase_admin()
        .table("pregnancies")
        .select("*")
        .or_(f"mother_id.eq.{user.id},companion_id.eq.{user.id}")
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active pregnancy found")
    return result.data[0]


def ensure_mother(user: CurrentUser, pregnancy: dict) -> None:
    if pregnancy["mother_id"] != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the mother can modify calendar events")


@router.get("/events")
def list_events(user: CurrentUser = Depends(get_current_user)) -> list[dict]:
    pregnancy = current_pregnancy(user)
    result = (
        get_supabase_admin()
        .table("calendar_events")
        .select("*")
        .eq("pregnancy_id", pregnancy["id"])
        .order("event_date", desc=False)
        .execute()
    )
    return result.data


@router.post("/events", status_code=status.HTTP_201_CREATED)
def create_event(payload: CalendarEventCreate, user: CurrentUser = Depends(get_current_user)) -> dict:
    pregnancy = current_pregnancy(user)
    ensure_mother(user, pregnancy)
    row = {
        "id": str(uuid4()),
        "pregnancy_id": pregnancy["id"],
        "created_by": user.id,
        **payload.model_dump(mode="json"),
    }
    result = get_supabase_admin().table("calendar_events").insert(row).execute()
    return result.data[0]


@router.patch("/events/{event_id}")
def update_event(event_id: str, payload: CalendarEventUpdate, user: CurrentUser = Depends(get_current_user)) -> dict:
    pregnancy = current_pregnancy(user)
    ensure_mother(user, pregnancy)
    result = (
        get_supabase_admin()
        .table("calendar_events")
        .update(payload.model_dump(exclude_unset=True, mode="json"))
        .eq("id", event_id)
        .eq("pregnancy_id", pregnancy["id"])
        .select("*")
        .single()
        .execute()
    )
    return result.data


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: str, user: CurrentUser = Depends(get_current_user)) -> None:
    pregnancy = current_pregnancy(user)
    ensure_mother(user, pregnancy)
    get_supabase_admin().table("calendar_events").delete().eq("id", event_id).eq("pregnancy_id", pregnancy["id"]).execute()
