from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from uuid import uuid4

import pytest

from app.schemas.calendar import CalendarEventCreate
from app.schemas.health import KickSessionCreate, SymptomUpdate, VitalCreate, VitaminCreate
from app.schemas.profile import PregnancyCreate
from app.schemas.resources import ChecklistItemCreate
from scripts.seed_judges import SEED, build_demo_rows, require_demo_account


def test_demo_family_has_valid_linked_records_and_partial_progress():
    mother, companion = str(uuid4()), str(uuid4())
    now = datetime(2026, 11, 6, 10, tzinfo=timezone(timedelta(hours=7)))
    rows = build_demo_rows(mother, companion, now)
    pregnancy = rows["pregnancies"][0]
    PregnancyCreate.model_validate(pregnancy)
    assert pregnancy["mother_id"] == mother and pregnancy["companion_id"] == companion
    assert pregnancy["hpht_date"] == "2026-03-24"
    assert pregnancy["due_date"] == "2026-12-29"
    for table, records in rows.items():
        assert len({r["id"] for r in records}) == len(records)
        if table != "pregnancies":
            assert all(r["pregnancy_id"] == pregnancy["id"] for r in records)
    for table, schema in (
        ("vital_logs", VitalCreate), ("vitamins", VitaminCreate), ("symptom_logs", SymptomUpdate),
        ("kick_sessions", KickSessionCreate), ("calendar_events", CalendarEventCreate),
        ("checklist_items", ChecklistItemCreate),
    ):
        for record in rows[table]:
            schema.model_validate(record)
    vitamin_ids = {v["id"] for v in rows["vitamins"]}
    assert all(r["vitamin_id"] in vitamin_ids for r in rows["vitamin_logs"])
    assert len([r for r in rows["vitamin_logs"] if r["completed_on"] == "2026-11-06"]) == 2
    assert sum(r["completed"] for r in rows["checklist_items"]) == 7
    assert not any(r["is_active"] for r in rows["symptom_logs"])
    assert all(datetime.fromisoformat(r["recorded_at"]) <= now for r in rows["vital_logs"])
    assert build_demo_rows(mother, companion, now) == rows


def test_demo_today_uses_wib_at_utc_date_boundary():
    rows = build_demo_rows(str(uuid4()), str(uuid4()), datetime(2026, 11, 5, 18, tzinfo=timezone.utc))
    assert {r["recorded_on"] for r in rows["symptom_logs"]} == {"2026-11-06"}
    assert all(datetime.fromisoformat(r["ended_at"]) <= datetime(2026, 11, 5, 18, tzinfo=timezone.utc)
               for r in rows["kick_sessions"])


def test_demo_seed_refuses_unrelated_accounts():
    with pytest.raises(RuntimeError, match="unrelated"):
        require_demo_account(SimpleNamespace(app_metadata={"provider": "email"}))
    require_demo_account(SimpleNamespace(app_metadata={"demo_seed": SEED}))
