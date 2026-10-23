from datetime import date, datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field


ProteinResult = Literal["Negatif", "+", "++", "+++"]
RiskLevel = Literal["green", "yellow", "red"]


class VitalCreate(BaseModel):
    recorded_at: datetime | None = None
    pregnancy_week: int = Field(ge=1, le=45)
    blood_pressure: str = Field(min_length=3, max_length=20)
    weight: Decimal | None = Field(default=None, ge=0, le=500)
    fundal_height: Decimal | None = Field(default=None, ge=0, le=60)
    fetal_movement: str | None = Field(default=None, max_length=40)
    hemoglobin: Decimal | None = Field(default=None, ge=0, le=30)
    urine_protein: ProteinResult = "Negatif"
    notes: str | None = Field(default=None, max_length=1000)


class SymptomUpdate(BaseModel):
    label: str = Field(min_length=1, max_length=120)
    risk_level: RiskLevel = "green"
    is_active: bool
    recorded_on: date | None = None


class VitaminCreate(BaseModel):
    label: str = Field(min_length=1, max_length=80)
    dose: str | None = Field(default=None, max_length=40)
    color: str = Field(default="#22c55e", max_length=20)


class VitaminUpdate(BaseModel):
    label: str | None = Field(default=None, min_length=1, max_length=80)
    dose: str | None = Field(default=None, max_length=40)
    color: str | None = Field(default=None, max_length=20)
    active: bool | None = None


class VitaminLogRequest(BaseModel):
    completed_on: date | None = None


class KickSessionCreate(BaseModel):
    started_at: datetime
    ended_at: datetime | None = None
    kick_count: int = Field(ge=0, le=1000)


class ContractionSessionCreate(BaseModel):
    started_at: datetime
    ended_at: datetime
    duration_seconds: int = Field(ge=0, le=86400)
    gap_minutes: int | None = Field(default=None, ge=0, le=10000)
