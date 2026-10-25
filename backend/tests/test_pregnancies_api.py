from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.api.routes import pregnancies
from app.core.auth import CurrentUser, get_current_user
from app.main import app
from app.schemas.profile import PregnancyUpdate


client = TestClient(app)


def _as_role(monkeypatch, role: str) -> None:
    app.dependency_overrides[get_current_user] = lambda: CurrentUser(id="user-1", email="user@example.com")
    monkeypatch.setattr(pregnancies, "_profile_role", lambda user: role)


def test_companion_cannot_create_pregnancy(monkeypatch) -> None:
    _as_role(monkeypatch, "companion")
    try:
        response = client.post("/api/pregnancies", json={"hpht_date": "2026-01-12"})
    finally:
        app.dependency_overrides.clear()
    assert response.status_code == 403


def test_mother_cannot_pair_with_sync_code(monkeypatch) -> None:
    _as_role(monkeypatch, "mother")
    try:
        response = client.post("/api/pregnancies/pair", json={"sync_code": "ABCD1234"})
    finally:
        app.dependency_overrides.clear()
    assert response.status_code == 403


def test_pregnancy_routes_require_authentication() -> None:
    assert client.get("/api/pregnancies/current").status_code == 401
    assert client.patch("/api/pregnancies/current", json={"birth_at": None}).status_code == 401


def test_birth_at_accepts_past_time_and_admin_progress() -> None:
    born = datetime.now(timezone.utc) - timedelta(hours=2)
    payload = PregnancyUpdate(birth_at=born, postpartum_admin={"surat": True, "akta": False})
    dumped = payload.model_dump(exclude_unset=True, mode="json")
    assert dumped["postpartum_admin"] == {"surat": True, "akta": False}
    assert isinstance(dumped["birth_at"], str)


def test_birth_at_can_be_cleared() -> None:
    assert PregnancyUpdate(birth_at=None).model_dump(exclude_unset=True) == {"birth_at": None}


def test_birth_at_rejects_future_time() -> None:
    try:
        PregnancyUpdate(birth_at=datetime.now(timezone.utc) + timedelta(days=1))
    except ValidationError:
        return
    raise AssertionError("PregnancyUpdate accepted a birth time in the future")


def test_birth_at_requires_timezone() -> None:
    try:
        PregnancyUpdate(birth_at=datetime(2026, 10, 25, 13, 52))
    except ValidationError:
        return
    raise AssertionError("PregnancyUpdate accepted a birth time without timezone")
