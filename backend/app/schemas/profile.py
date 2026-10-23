from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str | None = None
    phone: str | None = None
    role: str
    notif_vitamin: bool
    notif_anc: bool
    notif_emergency_sound: bool
    notif_weekly_report: bool
    created_at: datetime


class ProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=40)


class PreferencesUpdate(BaseModel):
    notif_vitamin: bool | None = None
    notif_anc: bool | None = None
    notif_emergency_sound: bool | None = None
    notif_weekly_report: bool | None = None


class PregnancyCreate(BaseModel):
    hpht_date: date
    blood_type: str | None = None
    hospital: str | None = None
    doctor: str | None = None


class PregnancyUpdate(BaseModel):
    hpht_date: date | None = None
    blood_type: str | None = None
    hospital: str | None = None
    doctor: str | None = None


class PairPregnancyRequest(BaseModel):
    sync_code: str = Field(min_length=4, max_length=32)


class PregnancyResponse(PregnancyCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    mother_id: UUID
    companion_id: UUID | None = None
    due_date: date
    sync_code: str
    created_at: datetime
