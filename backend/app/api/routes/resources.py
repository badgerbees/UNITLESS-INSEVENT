from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import CurrentUser, get_current_user
from app.core.supabase import get_supabase_admin
from app.schemas.resources import (
    BirthPlanUpdate,
    ChecklistCategoryCreate,
    ChecklistItemCreate,
    ChecklistItemUpdate,
)


router = APIRouter(prefix="/resources")


DEFAULT_CHECKLIST = (
    ("Ibu", ("Baju ganti (3 stel)", "Pembalut bersalin", "Perlengkapan mandi")),
    ("Bayi", ("Baju bayi (5 stel)", "Selimut bedong", "Popok newborn")),
    ("Dokumen", ("Kartu BPJS", "KTP suami-istri", "Buku KIA")),
    ("Lain-lain", ("Charger & powerbank",)),
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
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the mother can modify preparation data")


def seed_default_checklist(pregnancy_id: str, created_by: str) -> None:
    """Create the default preparation checklist once for a pregnancy."""
    supabase = get_supabase_admin()
    existing = supabase.table("checklist_categories").select("id").eq("pregnancy_id", pregnancy_id).limit(1).execute()
    if existing.data:
        return

    for category_position, (name, labels) in enumerate(DEFAULT_CHECKLIST):
        category = supabase.table("checklist_categories").insert({
            "id": str(uuid4()),
            "pregnancy_id": pregnancy_id,
            "name": name,
            "position": category_position,
        }).execute().data[0]
        supabase.table("checklist_items").insert([
            {
                "id": str(uuid4()),
                "pregnancy_id": pregnancy_id,
                "category_id": category["id"],
                "created_by": created_by,
                "label": label,
                "position": item_position,
            }
            for item_position, label in enumerate(labels)
        ]).execute()


@router.get("/checklist")
def get_checklist(user: CurrentUser = Depends(get_current_user)) -> list[dict]:
    pregnancy = current_pregnancy(user)
    seed_default_checklist(pregnancy["id"], pregnancy["mother_id"])
    supabase = get_supabase_admin()
    categories = supabase.table("checklist_categories").select("*").eq("pregnancy_id", pregnancy["id"]).order("position").execute().data
    items = supabase.table("checklist_items").select("*").eq("pregnancy_id", pregnancy["id"]).order("position").execute().data
    return [{**category, "items": [item for item in items if item["category_id"] == category["id"]]} for category in categories]


@router.post("/checklist/categories", status_code=status.HTTP_201_CREATED)
def create_category(payload: ChecklistCategoryCreate, user: CurrentUser = Depends(get_current_user)) -> dict:
    pregnancy = current_pregnancy(user)
    ensure_mother(user, pregnancy)
    result = get_supabase_admin().table("checklist_categories").insert({"id": str(uuid4()), "pregnancy_id": pregnancy["id"], **payload.model_dump()}).execute()
    return result.data[0]


@router.post("/checklist/items", status_code=status.HTTP_201_CREATED)
def create_item(payload: ChecklistItemCreate, user: CurrentUser = Depends(get_current_user)) -> dict:
    pregnancy = current_pregnancy(user)
    ensure_mother(user, pregnancy)
    category = get_supabase_admin().table("checklist_categories").select("id").eq("id", str(payload.category_id)).eq("pregnancy_id", pregnancy["id"]).single().execute()
    if not category.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checklist category not found")
    row = {"id": str(uuid4()), "pregnancy_id": pregnancy["id"], "created_by": user.id, **payload.model_dump(mode="json")}
    result = get_supabase_admin().table("checklist_items").insert(row).execute()
    return result.data[0]


@router.patch("/checklist/items/{item_id}")
def update_item(item_id: str, payload: ChecklistItemUpdate, user: CurrentUser = Depends(get_current_user)) -> dict:
    pregnancy = current_pregnancy(user)
    ensure_mother(user, pregnancy)
    result = (
        get_supabase_admin()
        .table("checklist_items")
        .update(payload.model_dump(exclude_unset=True))
        .eq("id", item_id)
        .eq("pregnancy_id", pregnancy["id"])
        .select("*")
        .single()
        .execute()
    )
    return result.data


@router.delete("/checklist/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: str, user: CurrentUser = Depends(get_current_user)) -> None:
    pregnancy = current_pregnancy(user)
    ensure_mother(user, pregnancy)
    get_supabase_admin().table("checklist_items").delete().eq("id", item_id).eq("pregnancy_id", pregnancy["id"]).execute()


@router.get("/birth-plan")
def get_birth_plan(user: CurrentUser = Depends(get_current_user)) -> list[dict]:
    pregnancy = current_pregnancy(user)
    return get_supabase_admin().table("birth_plans").select("*").eq("pregnancy_id", pregnancy["id"]).order("option_key").execute().data


@router.put("/birth-plan/{option_key}")
def update_birth_plan(option_key: str, payload: BirthPlanUpdate, user: CurrentUser = Depends(get_current_user)) -> dict:
    pregnancy = current_pregnancy(user)
    ensure_mother(user, pregnancy)
    row = {"id": str(uuid4()), "pregnancy_id": pregnancy["id"], "option_key": option_key, "selected": payload.selected}
    result = get_supabase_admin().table("birth_plans").upsert(row, on_conflict="pregnancy_id,option_key").execute()
    return result.data[0]
