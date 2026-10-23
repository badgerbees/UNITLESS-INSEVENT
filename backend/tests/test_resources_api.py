from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.main import app
from app.api.routes.resources import DEFAULT_CHECKLIST
from app.schemas.resources import ChecklistItemCreate


client = TestClient(app)


def test_resources_routes_require_authentication() -> None:
    assert client.get("/api/resources/checklist").status_code == 401
    assert client.get("/api/resources/birth-plan").status_code == 401


def test_checklist_item_requires_a_label() -> None:
    try:
        ChecklistItemCreate(category_id="00000000-0000-0000-0000-000000000000", label="")
    except ValidationError:
        return
    raise AssertionError("ChecklistItemCreate accepted an empty label")


def test_default_checklist_contains_expected_categories_and_items() -> None:
    assert [category[0] for category in DEFAULT_CHECKLIST] == ["Ibu", "Bayi", "Dokumen", "Lain-lain"]
    assert sum(len(category[1]) for category in DEFAULT_CHECKLIST) == 10
