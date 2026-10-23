from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.schemas.health import VitalCreate


client = TestClient(app)


def test_health_routes_require_authentication() -> None:
    for path in ("/api/health/vitals", "/api/health/symptoms", "/api/health/vitamins"):
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
