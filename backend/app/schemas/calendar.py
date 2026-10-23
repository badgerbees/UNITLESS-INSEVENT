from datetime import date
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


CalendarEventType = Literal["anc", "vitamin", "hpl", "other"]


class CalendarEventCreate(BaseModel):
    event_date: date
    label: str = Field(min_length=1, max_length=160)
    event_type: CalendarEventType = "other"
    notes: str | None = Field(default=None, max_length=1000)


class CalendarEventUpdate(BaseModel):
    event_date: date | None = None
    label: str | None = Field(default=None, min_length=1, max_length=160)
    event_type: CalendarEventType | None = None
    notes: str | None = Field(default=None, max_length=1000)
    completed: bool | None = None


class CalendarEventResponse(CalendarEventCreate):
    id: UUID
    pregnancy_id: UUID
    created_by: UUID
    completed: bool
