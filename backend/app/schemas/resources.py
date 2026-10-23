from uuid import UUID

from pydantic import BaseModel, Field


class ChecklistCategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    position: int = Field(default=0, ge=0, le=1000)


class ChecklistItemCreate(BaseModel):
    category_id: UUID
    label: str = Field(min_length=1, max_length=160)
    position: int = Field(default=0, ge=0, le=1000)


class ChecklistItemUpdate(BaseModel):
    label: str | None = Field(default=None, min_length=1, max_length=160)
    completed: bool | None = None
    position: int | None = Field(default=None, ge=0, le=1000)


class BirthPlanUpdate(BaseModel):
    selected: bool
