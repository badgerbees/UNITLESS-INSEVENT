from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.routes.calendar import current_pregnancy
from app.api.routes.notifications import notify
from app.core.auth import CurrentUser, get_current_user
from app.core.supabase import get_supabase_admin
from app.schemas.notifications import EmergencyAlertAck, EmergencyAlertCreate


router = APIRouter(prefix="/emergency")

# Alert yang belum diselesaikan dianggap tidak aktif lagi setelah jangka waktu ini
ACTIVE_WINDOW = timedelta(hours=24)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _get_alert(alert_id: str, pregnancy: dict) -> dict:
    result = (
        get_supabase_admin()
        .table("emergency_alerts")
        .select("*")
        .eq("id", alert_id)
        .eq("pregnancy_id", pregnancy["id"])
        .limit(1)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency alert not found")
    return result.data[0]


@router.get("/alerts/active")
def get_active_alert(user: CurrentUser = Depends(get_current_user)) -> dict | None:
    pregnancy = current_pregnancy(user)
    since = (datetime.now(timezone.utc) - ACTIVE_WINDOW).isoformat()
    result = (
        get_supabase_admin()
        .table("emergency_alerts")
        .select("*")
        .eq("pregnancy_id", pregnancy["id"])
        .is_("resolved_at", "null")
        .gte("created_at", since)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


@router.post("/alerts", status_code=status.HTTP_201_CREATED)
def send_alert(payload: EmergencyAlertCreate, user: CurrentUser = Depends(get_current_user)) -> dict:
    pregnancy = current_pregnancy(user)
    if pregnancy["mother_id"] != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the mother can send an emergency alert")

    supabase = get_supabase_admin()
    # Alert lama yang masih terbuka digantikan oleh alert baru (mis. "Kirim Ulang")
    supabase.table("emergency_alerts").update({"resolved_at": _now()}).eq("pregnancy_id", pregnancy["id"]).is_("resolved_at", "null").execute()

    row = {
        "id": str(uuid4()),
        "pregnancy_id": pregnancy["id"],
        "sent_by": user.id,
        **payload.model_dump(),
    }
    alert = supabase.table("emergency_alerts").insert(row).execute().data[0]

    if pregnancy.get("companion_id"):
        notify([{
            "user_id": pregnancy["companion_id"],
            "pregnancy_id": pregnancy["id"],
            "kind": "emergency",
            "title": "DARURAT dari Bunda!",
            "body": payload.message,
            "link": "/emergency",
            "dedupe_key": f"emergency:{alert['id']}",
        }])
    return {**alert, "companion_notified": bool(pregnancy.get("companion_id"))}


@router.post("/alerts/{alert_id}/ack")
def acknowledge_alert(alert_id: str, payload: EmergencyAlertAck, user: CurrentUser = Depends(get_current_user)) -> dict:
    pregnancy = current_pregnancy(user)
    if pregnancy.get("companion_id") != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the companion can acknowledge an alert")
    _get_alert(alert_id, pregnancy)

    alert = (
        get_supabase_admin()
        .table("emergency_alerts")
        .update({"acknowledged_at": _now(), "eta_minutes": payload.eta_minutes})
        .eq("id", alert_id)
        .execute()
        .data[0]
    )
    eta = f" Perkiraan tiba ~{payload.eta_minutes} menit." if payload.eta_minutes is not None else ""
    notify([{
        "user_id": pregnancy["mother_id"],
        "pregnancy_id": pregnancy["id"],
        "kind": "emergency_ack",
        "title": "Suami sudah menerima panggilan darurat",
        "body": f"Suami sedang menuju ke Bunda.{eta}",
        "link": "/emergency",
        "dedupe_key": f"emergency_ack:{alert_id}:{payload.eta_minutes}",
    }])
    return alert


@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: str, user: CurrentUser = Depends(get_current_user)) -> dict:
    pregnancy = current_pregnancy(user)
    if pregnancy["mother_id"] != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the mother can resolve an alert")
    _get_alert(alert_id, pregnancy)

    alert = get_supabase_admin().table("emergency_alerts").update({"resolved_at": _now()}).eq("id", alert_id).execute().data[0]
    if pregnancy.get("companion_id"):
        notify([{
            "user_id": pregnancy["companion_id"],
            "pregnancy_id": pregnancy["id"],
            "kind": "emergency_resolved",
            "title": "Kondisi darurat sudah selesai",
            "body": "Bunda menandai keadaan darurat sudah aman.",
            "link": "/dashboard",
            "dedupe_key": f"emergency_resolved:{alert_id}",
        }])
    return alert
