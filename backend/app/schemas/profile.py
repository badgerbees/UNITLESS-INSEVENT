from datetime import date, datetime, timedelta, timezone
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


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
    # null mengembalikan ke mode kehamilan (mis. tombol "Bayi Telah Lahir" tidak sengaja ditekan)
    birth_at: datetime | None = None
    postpartum_admin: dict[str, bool] | None = None

    @field_validator("birth_at")
    @classmethod
    def birth_not_in_future(cls, value: datetime | None) -> datetime | None:
        if value is None:
            return value
        if value.tzinfo is None:
            raise ValueError("birth_at must include a timezone")
        # Toleransi 5 menit untuk selisih jam perangkat
        if value > datetime.now(timezone.utc) + timedelta(minutes=5):
            raise ValueError("birth_at cannot be in the future")
        return value


class PairPregnancyRequest(BaseModel):
    sync_code: str = Field(min_length=4, max_length=32)


class PregnancyResponse(PregnancyCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    mother_id: UUID
    companion_id: UUID | None = None
    due_date: date
    sync_code: str
    sync_code_expires_at: datetime
    sync_code_used_at: datetime | None = None
    birth_at: datetime | None = None
    postpartum_admin: dict[str, bool] = {}
    created_at: datetime
