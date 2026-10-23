from collections.abc import Iterable
from datetime import datetime, timezone
from statistics import mean

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import CurrentUser, get_current_user
from app.core.supabase import get_supabase_admin


router = APIRouter(prefix="/reports")


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


def summarize_vitals(records: Iterable[dict]) -> dict:
    rows = list(records)
    weights = [float(row["weight"]) for row in rows if row.get("weight") is not None]
    hemoglobins = [float(row["hemoglobin"]) for row in rows if row.get("hemoglobin") is not None]
    protein_flags = sum(1 for row in rows if row.get("urine_protein", "Negatif") != "Negatif")
    weeks = sorted({int(row["pregnancy_week"]) for row in rows if row.get("pregnancy_week") is not None})
    latest = rows[-1] if rows else None

    return {
        "total_vitals": len(rows),
        "latest": latest,
        "average_weight": round(mean(weights), 2) if weights else None,
        "average_hemoglobin": round(mean(hemoglobins), 2) if hemoglobins else None,
        "protein_flags": protein_flags,
        "weeks_recorded": weeks,
    }


def fetch_vitals(pregnancy_id: str) -> list[dict]:
    result = (
        get_supabase_admin()
        .table("vital_logs")
        .select("*")
        .eq("pregnancy_id", pregnancy_id)
        .order("recorded_at", desc=False)
        .execute()
    )
    return result.data


@router.get("/summary")
def report_summary(user: CurrentUser = Depends(get_current_user)) -> dict:
    pregnancy = current_pregnancy(user)
    return summarize_vitals(fetch_vitals(pregnancy["id"]))


@router.get("/vitals")
def report_vitals(user: CurrentUser = Depends(get_current_user)) -> list[dict]:
    pregnancy = current_pregnancy(user)
    return fetch_vitals(pregnancy["id"])


@router.get("/export")
def export_report(user: CurrentUser = Depends(get_current_user)) -> dict:
    pregnancy = current_pregnancy(user)
    vitals = fetch_vitals(pregnancy["id"])
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "pregnancy": pregnancy,
        "summary": summarize_vitals(vitals),
        "vitals": vitals,
    }
