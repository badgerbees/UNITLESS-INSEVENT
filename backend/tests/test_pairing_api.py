import json
from datetime import datetime, timedelta, timezone

import httpx
import pytest
from fastapi.testclient import TestClient
from supabase import create_client
from supabase.lib.client_options import SyncClientOptions

from app.api.routes import pregnancies
from app.core.auth import CurrentUser, get_current_user
from app.core.config import settings
from app.main import app


client = TestClient(app)


@pytest.fixture
def database(monkeypatch):
    requests = []
    state = {
        "match": True,
        "claimed_elsewhere": False,
        "pregnancy": {"id": "pregnancy-1", "mother_id": "mother-1", "companion_id": None},
    }

    def respond(request):
        requests.append(request)
        if request.method == "GET":
            rows = [state["pregnancy"]] if state["match"] else []
            if "object+json" in request.headers.get("accept", ""):
                if not rows:
                    return httpx.Response(406, json={
                        "code": "PGRST116", "message": "JSON object requested, multiple (or no) rows returned",
                        "details": "The result contains 0 rows", "hint": None,
                    })
                return httpx.Response(200, json=rows[0])
            return httpx.Response(200, json=rows)
        assert request.method == "PATCH"
        rows = [] if state["claimed_elsewhere"] else [{**state["pregnancy"], **json.loads(request.content)}]
        return httpx.Response(200, json=rows[0] if rows and "object+json" in request.headers.get("accept", "") else rows)

    transport = httpx.Client(transport=httpx.MockTransport(respond))
    sdk = create_client("https://example.supabase.co", "test-key", options=SyncClientOptions(
        httpx_client=transport, persist_session=False, auto_refresh_token=False,
    ))
    monkeypatch.setattr(pregnancies, "get_supabase_admin", lambda: sdk)
    monkeypatch.setattr(pregnancies, "_profile_role", lambda _user: "companion")
    app.dependency_overrides[get_current_user] = lambda: CurrentUser(id="companion-1", email="companion@example.com")
    try:
        yield state, requests
    finally:
        app.dependency_overrides.clear()
        transport.close()


@pytest.mark.parametrize("code", ["EXPIRED", "UNKNOWN", "USED123"])
def test_unavailable_pairing_code_returns_readable_error_with_cors(database, code):
    state, requests = database
    state["match"] = False
    origin = settings.cors_origins[0]
    response = client.post("/api/pregnancies/pair", json={"sync_code": code}, headers={"Origin": origin})
    assert response.status_code == 404
    assert "kedaluwarsa" in response.json()["detail"]
    assert response.headers["access-control-allow-origin"] == origin
    assert [request.method for request in requests] == ["GET"]


def test_valid_pairing_claims_code_once_using_authenticated_companion(database):
    _, requests = database
    response = client.post("/api/pregnancies/pair", json={"sync_code": " abc234 "})
    assert response.status_code == 200
    assert response.json()["companion_id"] == "companion-1"
    assert response.json()["sync_code_used_at"]
    assert [request.method for request in requests] == ["GET", "PATCH"]
    for request in requests:
        assert request.url.params["sync_code"] == "eq.ABC234"
        assert request.url.params["companion_id"] == "is.null"
        assert request.url.params["sync_code_used_at"] == "is.null"
        assert request.url.params["sync_code_expires_at"].startswith("gt.")


def test_pairing_race_returns_conflict_instead_of_crashing(database):
    state, _ = database
    state["claimed_elsewhere"] = True
    response = client.post("/api/pregnancies/pair", json={"sync_code": "ABC234"})
    assert response.status_code == 409
    assert "Kode" in response.json()["detail"]


def test_mother_cannot_pair_with_herself_even_if_code_matches(database):
    state, requests = database
    state["pregnancy"]["mother_id"] = "companion-1"
    response = client.post("/api/pregnancies/pair", json={"sync_code": "ABC234"})
    assert response.status_code == 400
    assert [request.method for request in requests] == ["GET"]


def test_generate_sync_code_produces_fresh_fifteen_minute_code(database, monkeypatch):
    state, requests = database
    monkeypatch.setattr(pregnancies, "_find_current", lambda _user: state["pregnancy"])
    app.dependency_overrides[get_current_user] = lambda: CurrentUser(id="mother-1", email="mother@example.com")
    before = datetime.now(timezone.utc)
    response = client.post("/api/pregnancies/sync-code")
    assert response.status_code == 200
    body = response.json()
    assert len(body["sync_code"]) == 6
    assert set(body["sync_code"]) <= set(pregnancies.SYNC_CODE_ALPHABET)
    assert body["sync_code_used_at"] is None
    assert before + timedelta(minutes=14) < datetime.fromisoformat(body["sync_code_expires_at"]) <= before + timedelta(minutes=16)
    assert [request.method for request in requests] == ["PATCH"]
