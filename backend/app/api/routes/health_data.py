from datetime import date, datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.auth import CurrentUser, get_current_user
from app.core.supabase import get_supabase_admin
from app.schemas.health import (
    ContractionSessionCreate,
    KickSessionCreate,
    SymptomUpdate,
    VitaminCreate,
    VitaminLogRequest,
    VitaminUpdate,
    VitalCreate,
)


router = APIRouter(prefix="/health")

DEFAULT_VITAMINS = (
    ("Asam Folat", "400 mcg", "#e899a6"),
    ("Zat Besi", "60 mg", "#ef4444"),
    ("Kalsium", "500 mg", "#a0a0a0"),
    ("Vitamin D", "400 IU", "#f59e0b"),
)


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
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the mother can modify health data")


def seed_default_vitamins(pregnancy_id: str) -> list[dict]:
    supabase = get_supabase_admin()
    existing = supabase.table("vitamins").select("*").eq("pregnancy_id", pregnancy_id).eq("active", True).execute().data
    if existing:
        return existing
    result = supabase.table("vitamins").insert([
        {"id": str(uuid4()), "pregnancy_id": pregnancy_id, "label": label, "dose": dose, "color": color}
        for label, dose, color in DEFAULT_VITAMINS
    ]).execute()
    return result.data


@router.get("/vitals")
def list_vitals(user: CurrentUser = Depends(get_current_user)) -> list[dict]:
    pregnancy = current_pregnancy(user)
    result = (
        get_supabase_admin()
        .table("vital_logs")
        .select("*")
        .eq("pregnancy_id", pregnancy["id"])
        .order("recorded_at", desc=False)
        .execute()
    )
    return result.data


@router.post("/vitals", status_code=status.HTTP_201_CREATED)
def create_vital(payload: VitalCreate, user: CurrentUser = Depends(get_current_user)) -> dict:
    pregnancy = current_pregnancy(user)
    ensure_mother(user, pregnancy)
    row = {
        "id": str(uuid4()),
        "pregnancy_id": pregnancy["id"],
        "recorded_by": user.id,
        **payload.model_dump(exclude_none=True),
        "recorded_at": (payload.recorded_at or datetime.now(timezone.utc)).isoformat(),
    }
    result = get_supabase_admin().table("vital_logs").insert(row).execute()
    return result.data[0]


@router.get("/symptoms")
def list_symptoms(
    day: date | None = Query(default=None),
    user: CurrentUser = Depends(get_current_user),
) -> list[dict]:
    pregnancy = current_pregnancy(user)
    result = (
        get_supabase_admin()
        .table("symptom_logs")
        .select("*")
        .eq("pregnancy_id", pregnancy["id"])
        .eq("recorded_on", day or date.today())
        .execute()
    )
    return result.data


@router.put("/symptoms/{symptom_code}")
def update_symptom(
    symptom_code: str,
    payload: SymptomUpdate,
    user: CurrentUser = Depends(get_current_user),
) -> dict:
    pregnancy = current_pregnancy(user)
    ensure_mother(user, pregnancy)
    recorded_on = payload.recorded_on or date.today()
    row = {
        "id": str(uuid4()),
        "pregnancy_id": pregnancy["id"],
        "symptom_code": symptom_code,
        "recorded_on": recorded_on.isoformat(),
        **payload.model_dump(exclude={"recorded_on"}),
    }
    result = (
        get_supabase_admin()
        .table("symptom_logs")
        .upsert(row, on_conflict="pregnancy_id,symptom_code,recorded_on")
        .execute()
    )
    return result.data[0]


@router.get("/vitamins")
def list_vitamins(user: CurrentUser = Depends(get_current_user)) -> list[dict]:
    pregnancy = current_pregnancy(user)
    return seed_default_vitamins(pregnancy["id"])


@router.post("/vitamins", status_code=status.HTTP_201_CREATED)
def create_vitamin(payload: VitaminCreate, user: CurrentUser = Depends(get_current_user)) -> dict:
    pregnancy = current_pregnancy(user)
    ensure_mother(user, pregnancy)
    result = get_supabase_admin().table("vitamins").insert({"id": str(uuid4()), "pregnancy_id": pregnancy["id"], **payload.model_dump()}).execute()
    return result.data[0]


@router.patch("/vitamins/{vitamin_id}")
def update_vitamin(vitamin_id: str, payload: VitaminUpdate, user: CurrentUser = Depends(get_current_user)) -> dict:
    pregnancy = current_pregnancy(user)
    ensure_mother(user, pregnancy)
    result = (
        get_supabase_admin()
        .table("vitamins")
        .update(payload.model_dump(exclude_unset=True))
        .eq("id", vitamin_id)
        .eq("pregnancy_id", pregnancy["id"])
        .select("*")
        .single()
        .execute()
    )
    return result.data


@router.delete("/vitamins/{vitamin_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vitamin(vitamin_id: str, user: CurrentUser = Depends(get_current_user)) -> None:
    pregnancy = current_pregnancy(user)
    ensure_mother(user, pregnancy)
    get_supabase_admin().table("vitamins").update({"active": False}).eq("id", vitamin_id).eq("pregnancy_id", pregnancy["id"]).execute()


@router.get("/vitamins/logs")
def list_vitamin_logs(day: date | None = Query(default=None), user: CurrentUser = Depends(get_current_user)) -> list[dict]:
    pregnancy = current_pregnancy(user)
    result = (
        get_supabase_admin()
        .table("vitamin_logs")
        .select("*")
        .eq("pregnancy_id", pregnancy["id"])
        .eq("completed_on", day or date.today())
        .execute()
    )
    return result.data


@router.put("/vitamins/{vitamin_id}/logs")
def log_vitamin(vitamin_id: str, payload: VitaminLogRequest, user: CurrentUser = Depends(get_current_user)) -> dict:
    pregnancy = current_pregnancy(user)
    ensure_mother(user, pregnancy)
    row = {
        "id": str(uuid4()),
        "pregnancy_id": pregnancy["id"],
        "vitamin_id": vitamin_id,
        "completed_on": (payload.completed_on or date.today()).isoformat(),
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }
    result = get_supabase_admin().table("vitamin_logs").upsert(row, on_conflict="vitamin_id,completed_on").execute()
    return result.data[0]


@router.delete("/vitamins/{vitamin_id}/logs", status_code=status.HTTP_204_NO_CONTENT)
def remove_vitamin_log(vitamin_id: str, day: date | None = Query(default=None), user: CurrentUser = Depends(get_current_user)) -> None:
    pregnancy = current_pregnancy(user)
    ensure_mother(user, pregnancy)
    (
        get_supabase_admin()
        .table("vitamin_logs")
        .delete()
        .eq("vitamin_id", vitamin_id)
        .eq("pregnancy_id", pregnancy["id"])
        .eq("completed_on", day or date.today())
        .execute()
    )


@router.post("/kick-sessions", status_code=status.HTTP_201_CREATED)
def create_kick_session(payload: KickSessionCreate, user: CurrentUser = Depends(get_current_user)) -> dict:
    pregnancy = current_pregnancy(user)
    ensure_mother(user, pregnancy)
    result = get_supabase_admin().table("kick_sessions").insert({"id": str(uuid4()), "pregnancy_id": pregnancy["id"], "recorded_by": user.id, **payload.model_dump(mode="json")}).execute()
    return result.data[0]


@router.post("/contraction-sessions", status_code=status.HTTP_201_CREATED)
def create_contraction_session(payload: ContractionSessionCreate, user: CurrentUser = Depends(get_current_user)) -> dict:
    pregnancy = current_pregnancy(user)
    ensure_mother(user, pregnancy)
    result = get_supabase_admin().table("contraction_sessions").insert({"id": str(uuid4()), "pregnancy_id": pregnancy["id"], "recorded_by": user.id, **payload.model_dump(mode="json")}).execute()
    return result.data[0]
