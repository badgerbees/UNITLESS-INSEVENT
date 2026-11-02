import httpx
import pytest
from fastapi.testclient import TestClient
from supabase import create_client
from supabase.lib.client_options import SyncClientOptions

from app.api.routes import calendar, health_data, resources
from app.core.auth import CurrentUser, get_current_user
from app.main import app


PATHS = [
    "/api/health/vitals", "/api/health/vitamins", "/api/health/vitamins/logs?day=2026-11-02",
    "/api/health/symptoms?day=2026-11-02", "/api/calendar/events",
    "/api/resources/checklist", "/api/health/kick-sessions",
]


@pytest.fixture
def scoped_database(monkeypatch):
    requests = []

    def respond(request):
        requests.append(request)
        assert request.method == "GET", "Reading an existing dashboard must not modify data"
        table = request.url.path.rsplit("/", 1)[-1]
        if table == "pregnancies":
            scope = request.url.params["or"]
            assert "mother_id.eq." in scope and "companion_id.eq." in scope
            member = "mother-1" in scope or "companion-1" in scope
            rows = [{"id": "pregnancy-1", "mother_id": "mother-1", "companion_id": "companion-1"}] if member else []
        else:
            assert request.url.params["pregnancy_id"] == "eq.pregnancy-1"
            rows = {
                "vital_logs": [{"id": "vital-1", "blood_pressure": "121/79"}],
                "vitamins": [{"id": "vitamin-1", "label": "Vitamin Ibu", "active": True}],
                "vitamin_logs": [{"vitamin_id": "vitamin-1", "completed_on": "2026-11-02"}],
                "symptom_logs": [{"id": "symptom-1", "label": "Mual", "is_active": True}],
                "calendar_events": [{"id": "event-1", "label": "Kontrol Ibu"}],
                "checklist_categories": [{"id": "category-1", "name": "Dokumen"}],
                "checklist_items": [{"id": "item-1", "category_id": "category-1", "label": "Buku KIA", "completed": False}],
                "kick_sessions": [{"id": "kick-1", "kick_count": 12}],
            }[table]
        return httpx.Response(200, json=rows)

    transport = httpx.Client(transport=httpx.MockTransport(respond))
    sdk = create_client("https://example.supabase.co", "test-key", options=SyncClientOptions(
        httpx_client=transport, persist_session=False, auto_refresh_token=False,
    ))
    for route in (calendar, health_data, resources):
        monkeypatch.setattr(route, "get_supabase_admin", lambda: sdk)
    try:
        yield requests
    finally:
        app.dependency_overrides.clear()
        transport.close()


@pytest.mark.parametrize("path", PATHS)
def test_mother_and_companion_read_the_same_pregnancy_data(scoped_database, path):
    responses = []
    for user_id in ("mother-1", "companion-1"):
        app.dependency_overrides[get_current_user] = lambda user_id=user_id: CurrentUser(id=user_id, email=None)
        response = TestClient(app).get(path)
        assert response.status_code == 200
        responses.append(response.json())
    assert responses[0] == responses[1]
    assert responses[0], "Fixture must include actual records to verify sharing"


@pytest.mark.parametrize("path", PATHS)
def test_unrelated_account_cannot_read_shared_dashboard_data(scoped_database, path):
    app.dependency_overrides[get_current_user] = lambda: CurrentUser(id="stranger-1", email=None)
    response = TestClient(app).get(path)
    assert response.status_code == 404
    assert all(request.url.path.endswith("/pregnancies") for request in scoped_database)
