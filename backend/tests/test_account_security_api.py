from types import SimpleNamespace
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient
from supabase_auth.errors import AuthApiError

from app.api.routes import me
from app.core.auth import CurrentUser, get_current_user
from app.main import app


client = TestClient(app)


@pytest.fixture
def account_clients(monkeypatch):
    admin = Mock()
    verifier = Mock()
    verifier.auth.sign_in_with_password.return_value = SimpleNamespace(user=SimpleNamespace(id="user-1"))
    admin.auth.admin.update_user_by_id.return_value = SimpleNamespace(user=SimpleNamespace(email="new@example.com"))
    monkeypatch.setattr(me, "get_supabase_admin", lambda: admin)
    monkeypatch.setattr(me, "get_supabase_public", lambda: verifier)
    app.dependency_overrides[get_current_user] = lambda: CurrentUser(id="user-1", email="old@example.com")
    try:
        yield admin, verifier
    finally:
        app.dependency_overrides.clear()


def test_account_email_update_requires_authentication() -> None:
    response = client.patch("/api/me/email", json={"email": "new@example.com"})
    assert response.status_code == 401


def test_email_updates_only_authenticated_user(account_clients):
    admin, _ = account_clients
    response = client.patch("/api/me/email", json={"email": " New@Example.com "})
    assert response.status_code == 200
    assert response.json() == {"email": "new@example.com"}
    admin.auth.admin.update_user_by_id.assert_called_once_with("user-1", {"email": "new@example.com"})


@pytest.mark.parametrize("email", ["invalid", "@example.com", "a@@example.com", "user @example.com"])
def test_invalid_email_never_updates_auth(account_clients, email):
    admin, _ = account_clients
    assert client.patch("/api/me/email", json={"email": email}).status_code == 422
    admin.auth.admin.update_user_by_id.assert_not_called()


def test_email_conflict_is_reported(account_clients):
    admin, _ = account_clients
    admin.auth.admin.update_user_by_id.side_effect = AuthApiError("Email already registered", 422, "email_exists")
    response = client.patch("/api/me/email", json={"email": "taken@example.com"})
    assert response.status_code == 409


def test_password_verifies_current_credentials_before_updating(account_clients):
    admin, verifier = account_clients
    response = client.post("/api/me/password", json={"current_password": "old-password", "new_password": "new-password"})
    assert response.status_code == 200
    verifier.auth.sign_in_with_password.assert_called_once_with({"email": "old@example.com", "password": "old-password"})
    admin.auth.admin.update_user_by_id.assert_called_once_with("user-1", {"password": "new-password"})


@pytest.mark.parametrize("new_password", ["short", "old-password"])
def test_invalid_new_password_never_updates_auth(account_clients, new_password):
    admin, verifier = account_clients
    response = client.post("/api/me/password", json={"current_password": "old-password", "new_password": new_password})
    assert response.status_code == 422
    verifier.auth.sign_in_with_password.assert_not_called()
    admin.auth.admin.update_user_by_id.assert_not_called()


@pytest.mark.parametrize("error, expected_status", [
    (AuthApiError("Invalid credentials", 400, "invalid_credentials"), 400),
    (AuthApiError("Too many requests", 429, "over_request_rate_limit"), 429),
    (RuntimeError("Provider unavailable"), 502),
])
def test_failed_password_verification_never_changes_password(account_clients, error, expected_status):
    admin, verifier = account_clients
    verifier.auth.sign_in_with_password.side_effect = error
    response = client.post("/api/me/password", json={"current_password": "old-password", "new_password": "new-password"})
    assert response.status_code == expected_status
    admin.auth.admin.update_user_by_id.assert_not_called()


def test_verification_must_match_authenticated_user(account_clients):
    admin, verifier = account_clients
    verifier.auth.sign_in_with_password.return_value = SimpleNamespace(user=SimpleNamespace(id="someone-else"))
    response = client.post("/api/me/password", json={"current_password": "old-password", "new_password": "new-password"})
    assert response.status_code == 400
    admin.auth.admin.update_user_by_id.assert_not_called()


def test_account_password_update_requires_authentication() -> None:
    response = client.post(
        "/api/me/password",
        json={"current_password": "old-password", "new_password": "new-password"},
    )
    assert response.status_code == 401


def test_companion_onboarding_requires_authentication():
    assert client.post("/api/me/companion").status_code == 401


def test_companion_onboarding_corrects_only_the_current_profile(account_clients):
    admin, _ = account_clients
    pregnancy_query = Mock()
    profile_query = Mock()
    admin.table.side_effect = lambda name: {"pregnancies": pregnancy_query, "profiles": profile_query}[name]
    pregnancy_query.select.return_value.or_.return_value.limit.return_value.execute.return_value = SimpleNamespace(data=[])
    profile_query.update.return_value.eq.return_value.execute.return_value = SimpleNamespace(data=[{"id": "user-1", "role": "companion"}])

    response = client.post("/api/me/companion")

    assert response.status_code == 200
    assert response.json() == {"id": "user-1", "role": "companion"}
    profile_query.update.assert_called_once_with({"role": "companion"})
    profile_query.update.return_value.eq.assert_called_once_with("id", "user-1")
    pregnancy_query.select.return_value.or_.assert_called_once_with("mother_id.eq.user-1,companion_id.eq.user-1")


def test_companion_onboarding_preserves_accounts_with_pregnancy_data(account_clients):
    admin, _ = account_clients
    pregnancy_query = admin.table.return_value
    pregnancy_query.select.return_value.or_.return_value.limit.return_value.execute.return_value = SimpleNamespace(data=[{"id": "existing-pregnancy"}])

    response = client.post("/api/me/companion")

    assert response.status_code == 409
    admin.table.assert_called_once_with("pregnancies")
    pregnancy_query.update.assert_not_called()


def test_companion_onboarding_reports_missing_profile(account_clients):
    admin, _ = account_clients
    pregnancy_query = Mock()
    profile_query = Mock()
    admin.table.side_effect = lambda name: {"pregnancies": pregnancy_query, "profiles": profile_query}[name]
    pregnancy_query.select.return_value.or_.return_value.limit.return_value.execute.return_value = SimpleNamespace(data=[])
    profile_query.update.return_value.eq.return_value.execute.return_value = SimpleNamespace(data=[])

    assert client.post("/api/me/companion").status_code == 404


def test_me_repairs_a_misclassified_companion_before_returning_profile(account_clients):
    admin, _ = account_clients
    app.dependency_overrides[get_current_user] = lambda: CurrentUser(id="user-1", email="old@example.com", signup_role="companion")
    profile_query = Mock()
    pregnancy_query = Mock()
    admin.table.side_effect = lambda name: {"profiles": profile_query, "pregnancies": pregnancy_query}[name]
    profile_query.select.return_value.eq.return_value.maybe_single.return_value.execute.return_value = SimpleNamespace(data={"id": "user-1", "role": "mother"})
    pregnancy_query.select.return_value.or_.return_value.limit.return_value.execute.return_value = SimpleNamespace(data=[])
    profile_query.update.return_value.eq.return_value.execute.return_value = SimpleNamespace(data=[{"id": "user-1", "role": "companion"}])

    response = client.get("/api/me")

    assert response.status_code == 200
    assert response.json()["role"] == "companion"
    profile_query.update.assert_called_once_with({"role": "companion"})


def test_me_does_not_convert_mother_registrations(account_clients):
    admin, _ = account_clients
    app.dependency_overrides[get_current_user] = lambda: CurrentUser(id="user-1", email="old@example.com", signup_role="mother")
    query = admin.table.return_value
    query.select.return_value.eq.return_value.maybe_single.return_value.execute.return_value = SimpleNamespace(data={"id": "user-1", "role": "mother"})
    response = client.get("/api/me")
    assert response.status_code == 200
    assert response.json()["role"] == "mother"
    query.update.assert_not_called()


def test_me_preserves_existing_pregnancy_when_role_is_misclassified(account_clients):
    admin, _ = account_clients
    app.dependency_overrides[get_current_user] = lambda: CurrentUser(id="user-1", email="old@example.com", signup_role="companion")
    profile_query = Mock()
    pregnancy_query = Mock()
    admin.table.side_effect = lambda name: {"profiles": profile_query, "pregnancies": pregnancy_query}[name]
    profile_query.select.return_value.eq.return_value.maybe_single.return_value.execute.return_value = SimpleNamespace(data={"id": "user-1", "role": "mother"})
    pregnancy_query.select.return_value.or_.return_value.limit.return_value.execute.return_value = SimpleNamespace(data=[{"id": "keep-this-pregnancy"}])
    assert client.get("/api/me").status_code == 409
    profile_query.update.assert_not_called()
    pregnancy_query.delete.assert_not_called()
