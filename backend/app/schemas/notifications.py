from typing import Literal

from pydantic import BaseModel, Field


EmergencyTrigger = Literal["manual", "511", "symptom"]


class EmergencyAlertCreate(BaseModel):
    message: str = Field(min_length=1, max_length=500)
    trigger: EmergencyTrigger = "manual"
    location: str | None = Field(default=None, max_length=300)
    lat: float | None = Field(default=None, ge=-90, le=90)
    lng: float | None = Field(default=None, ge=-180, le=180)


class EmergencyAlertAck(BaseModel):
    eta_minutes: int | None = Field(default=None, ge=0, le=600)
