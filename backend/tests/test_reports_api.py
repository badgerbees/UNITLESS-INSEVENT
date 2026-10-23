from fastapi.testclient import TestClient

from app.api.routes.reports import summarize_vitals
from app.main import app


client = TestClient(app)


def test_reports_routes_require_authentication() -> None:
    assert client.get("/api/reports/summary").status_code == 401
    assert client.get("/api/reports/vitals").status_code == 401
    assert client.get("/api/reports/export").status_code == 401


def test_summarize_vitals_calculates_report_metrics() -> None:
    summary = summarize_vitals(
        [
            {"id": "1", "pregnancy_week": 20, "weight": 60, "hemoglobin": 11.5, "urine_protein": "Negatif"},
            {"id": "2", "pregnancy_week": 22, "weight": 61, "hemoglobin": 10.5, "urine_protein": "+"},
        ]
    )

    assert summary["total_vitals"] == 2
    assert summary["average_weight"] == 60.5
    assert summary["average_hemoglobin"] == 11.0
    assert summary["protein_flags"] == 1
    assert summary["weeks_recorded"] == [20, 22]
    assert summary["latest"]["id"] == "2"
