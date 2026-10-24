from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.auth import CurrentUser, get_current_user
from app.core.supabase import get_supabase_admin


router = APIRouter(prefix="/notifications")

# Pengingat dihitung dalam WIB tanpa bergantung pada data zona waktu sistem
WIB = timezone(timedelta(hours=7))
VITAMIN_SLOTS = (8, 20)


def notify(rows: list[dict]) -> None:
    """Simpan notifikasi; baris dengan dedupe_key yang sudah ada diabaikan."""
    if not rows:
        return
    get_supabase_admin().table("notifications").upsert(
        rows, on_conflict="user_id,dedupe_key", ignore_duplicates=True
    ).execute()


def due_reminders(
    *,
    user_id: str,
    profile: dict,
    pregnancy: dict,
    now: datetime,
    vitamins_pending: bool,
    anc_events: list[dict],
) -> list[dict]:
    """Daftar pengingat yang seharusnya sudah muncul untuk user pada waktu `now` (WIB)."""
    today = now.date()
    is_mother = pregnancy["mother_id"] == user_id
    base = {"user_id": user_id, "pregnancy_id": pregnancy["id"]}
    reminders: list[dict] = []

    if is_mother and profile.get("notif_vitamin") and vitamins_pending:
        passed = [slot for slot in VITAMIN_SLOTS if now.hour >= slot]
        if passed:
            slot = passed[-1]
            reminders.append({
                **base,
                "kind": "vitamin",
                "title": "Waktunya minum vitamin",
                "body": "Masih ada vitamin hari ini yang belum dicentang.",
                "link": "/health",
                "dedupe_key": f"vitamin:{today.isoformat()}:{slot:02d}",
            })

    if profile.get("notif_anc"):
        for event in anc_events:
            if event.get("completed"):
                continue
            event_date = date.fromisoformat(event["event_date"])
            if event_date == today + timedelta(days=1):
                title, suffix = "Besok jadwal kontrol", "h1"
            elif event_date == today:
                title, suffix = "Hari ini jadwal kontrol", "h0"
            else:
                continue
            reminders.append({
                **base,
                "kind": "anc",
                "title": title,
                "body": event["label"],
                "link": "/calendar",
                "dedupe_key": f"anc:{event['id']}:{suffix}",
            })

    if profile.get("notif_weekly_report"):
        week = (today - date.fromisoformat(pregnancy["hpht_date"])).days // 7
        if 1 <= week <= 42:
            reminders.append({
                **base,
                "kind": "weekly_report",
                "title": f"Selamat memasuki minggu ke-{week}!",
                "body": "Lihat perkembangan si kecil minggu ini di Beranda.",
                "link": "/dashboard",
                "dedupe_key": f"week:{pregnancy['id']}:{week}",
            })

    return reminders


def generate_reminders(user: CurrentUser) -> None:
    supabase = get_supabase_admin()
    pregnancy_result = (
        supabase.table("pregnancies")
        .select("*")
        .or_(f"mother_id.eq.{user.id},companion_id.eq.{user.id}")
        .limit(1)
        .execute()
    )
    if not pregnancy_result.data:
        return
    pregnancy = pregnancy_result.data[0]
    profile = (
        supabase.table("profiles")
        .select("notif_vitamin, notif_anc, notif_weekly_report")
        .eq("id", user.id)
        .maybe_single()
        .execute()
    )
    if not profile or not profile.data:
        return

    now = datetime.now(WIB)
    today = now.date().isoformat()
    vitamins = supabase.table("vitamins").select("id").eq("pregnancy_id", pregnancy["id"]).eq("active", True).execute()
    logs = (
        supabase.table("vitamin_logs")
        .select("vitamin_id")
        .eq("pregnancy_id", pregnancy["id"])
        .eq("completed_on", today)
        .execute()
    )
    logged = {log["vitamin_id"] for log in logs.data}
    vitamins_pending = any(vitamin["id"] not in logged for vitamin in vitamins.data)

    anc_events = (
        supabase.table("calendar_events")
        .select("id, event_date, label, completed")
        .eq("pregnancy_id", pregnancy["id"])
        .eq("event_type", "anc")
        .gte("event_date", today)
        .lte("event_date", (now.date() + timedelta(days=1)).isoformat())
        .execute()
    )

    notify(due_reminders(
        user_id=user.id,
        profile=profile.data,
        pregnancy=pregnancy,
        now=now,
        vitamins_pending=vitamins_pending,
        anc_events=anc_events.data,
    ))


@router.get("")
def list_notifications(user: CurrentUser = Depends(get_current_user)) -> list[dict]:
    generate_reminders(user)
    result = (
        get_supabase_admin()
        .table("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", desc=True)
        .limit(30)
        .execute()
    )
    return result.data


@router.post("/{notification_id}/read")
def mark_read(notification_id: str, user: CurrentUser = Depends(get_current_user)) -> dict:
    result = (
        get_supabase_admin()
        .table("notifications")
        .update({"read_at": datetime.now(timezone.utc).isoformat()})
        .eq("id", notification_id)
        .eq("user_id", user.id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return result.data[0]


@router.post("/read-all", status_code=status.HTTP_204_NO_CONTENT)
def mark_all_read(user: CurrentUser = Depends(get_current_user)) -> None:
    (
        get_supabase_admin()
        .table("notifications")
        .update({"read_at": datetime.now(timezone.utc).isoformat()})
        .eq("user_id", user.id)
        .is_("read_at", "null")
        .execute()
    )
