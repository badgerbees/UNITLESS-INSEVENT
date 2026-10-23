from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.schemas.calendar import CalendarEventCreate


client = TestClient(app)


def test_calendar_routes_require_authentication() -> None:
    assert client.get("/api/calendar/events").status_code == 401
    assert client.post("/api/calendar/events", json={"event_date": "2026-10-21", "label": "ANC"}).status_code == 401


def test_calendar_event_requires_a_label() -> None:
    try:
        CalendarEventCreate(event_date="2026-10-21", label="")
    except ValidationError:
        return
    raise AssertionError("CalendarEventCreate accepted an empty label")


def test_calendar_event_defaults_to_other() -> None:
    event = CalendarEventCreate(event_date="2026-10-21", label="Kelas persalinan")
    assert event.event_type == "other"
