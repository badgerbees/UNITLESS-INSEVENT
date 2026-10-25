from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.schemas.health import VitalCreate


client = TestClient(app)


def test_health_routes_require_authentication() -> None:
    for path in ("/api/health/vitals", "/api/health/symptoms", "/api/health/vitamins", "/api/health/kick-sessions", "/api/health/contraction-sessions"):
        response = client.get(path)
        assert response.status_code == 401


def test_health_write_routes_require_authentication() -> None:
    response = client.post(
        "/api/health/vitals",
        json={
            "pregnancy_week": 20,
            "blood_pressure": "120/80",
        },
    )
    assert response.status_code == 401
    assert client.delete("/api/health/vitamins/00000000-0000-0000-0000-000000000000/logs").status_code == 401


def test_vital_schema_rejects_invalid_pregnancy_week() -> None:
    try:
        VitalCreate(pregnancy_week=0, blood_pressure="120/80")
    except ValidationError:
        return
    raise AssertionError("VitalCreate accepted an invalid pregnancy week")


def test_vital_schema_applies_default_protein_result() -> None:
    vital = VitalCreate(pregnancy_week=20, blood_pressure="120/80")
    assert vital.urine_protein == "Negatif"


def test_create_vital_sends_json_serializable_row(monkeypatch) -> None:
    import json

    from app.api.routes import health_data
    from app.core.auth import CurrentUser, get_current_user

    inserted: list[dict] = []

    class FakeQuery:
        def insert(self, row: dict) -> "FakeQuery":
            json.dumps(row)  # sama seperti yang dilakukan klien Supabase sebelum mengirim
            inserted.append(row)
            return self

        def execute(self):
            return type("Result", (), {"data": inserted})()

    class FakeSupabase:
        def table(self, _name: str) -> FakeQuery:
            return FakeQuery()

    monkeypatch.setattr(health_data, "get_supabase_admin", lambda: FakeSupabase())
    monkeypatch.setattr(health_data, "current_pregnancy", lambda _user: {"id": "preg-1", "mother_id": "mother-1"})
    app.dependency_overrides[get_current_user] = lambda: CurrentUser(id="mother-1", email=None)
    try:
        response = client.post("/api/health/vitals", json={
            "pregnancy_week": 40, "blood_pressure": "118/76", "weight": 68.5, "fundal_height": 32, "hemoglobin": 11.8,
        })
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 201
    assert inserted[0]["weight"] == "68.5"
