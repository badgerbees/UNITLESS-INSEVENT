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
