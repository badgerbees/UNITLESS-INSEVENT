from datetime import datetime

from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.api.routes.notifications import WIB, due_reminders
from app.main import app
from app.schemas.notifications import EmergencyAlertCreate


client = TestClient(app)

PREGNANCY = {"id": "preg-1", "mother_id": "mother-1", "companion_id": "companion-1", "hpht_date": "2026-03-01"}
ALL_ON = {"notif_vitamin": True, "notif_anc": True, "notif_weekly_report": True}


def reminders(user_id: str = "mother-1", profile: dict = ALL_ON, hour: int = 9, **kwargs) -> list[dict]:
    options = {"vitamins_pending": True, "anc_events": [], **kwargs}
    return due_reminders(
        user_id=user_id,
        profile=profile,
        pregnancy=PREGNANCY,
        now=datetime(2026, 10, 24, hour, 0, tzinfo=WIB),
        **options,
    )


def test_notification_routes_require_authentication() -> None:
    assert client.get("/api/notifications").status_code == 401
    assert client.post("/api/notifications/read-all").status_code == 401
    assert client.get("/api/emergency/alerts/active").status_code == 401
    assert client.post("/api/emergency/alerts", json={"message": "Tolong"}).status_code == 401


def test_emergency_alert_requires_a_message() -> None:
    try:
        EmergencyAlertCreate(message="")
    except ValidationError:
        return
    raise AssertionError("EmergencyAlertCreate accepted an empty message")


def test_vitamin_reminder_uses_latest_passed_slot() -> None:
    assert not [r for r in reminders(hour=7) if r["kind"] == "vitamin"]
    morning = [r for r in reminders(hour=9) if r["kind"] == "vitamin"]
    evening = [r for r in reminders(hour=21) if r["kind"] == "vitamin"]
    assert morning[0]["dedupe_key"] == "vitamin:2026-10-24:08"
    assert evening[0]["dedupe_key"] == "vitamin:2026-10-24:20"
    assert len(evening) == 1


def test_vitamin_reminder_only_for_mother_with_pending_vitamins() -> None:
    assert not [r for r in reminders(vitamins_pending=False) if r["kind"] == "vitamin"]
    assert not [r for r in reminders(user_id="companion-1") if r["kind"] == "vitamin"]


def test_anc_reminder_day_before_and_same_day() -> None:
    events = [
        {"id": "e1", "event_date": "2026-10-25", "label": "Kontrol ANC", "completed": False},
        {"id": "e2", "event_date": "2026-10-24", "label": "USG", "completed": False},
        {"id": "e3", "event_date": "2026-10-24", "label": "Selesai", "completed": True},
    ]
    keys = {r["dedupe_key"] for r in reminders(user_id="companion-1", anc_events=events) if r["kind"] == "anc"}
    assert keys == {"anc:e1:h1", "anc:e2:h0"}


def test_weekly_report_follows_pregnancy_week() -> None:
    weekly = [r for r in reminders() if r["kind"] == "weekly_report"]
    assert weekly[0]["dedupe_key"] == "week:preg-1:33"


def test_preferences_disable_reminders() -> None:
    off = {"notif_vitamin": False, "notif_anc": False, "notif_weekly_report": False}
    events = [{"id": "e1", "event_date": "2026-10-25", "label": "ANC", "completed": False}]
    assert reminders(profile=off, anc_events=events) == []
