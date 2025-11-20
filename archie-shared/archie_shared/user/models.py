from typing import Any
from pydantic import BaseModel


class UserState(BaseModel):
    """User state model for Redis storage - shared across all Archie services"""

    user_id: str
    user_name: str | None = None
    default_city: str | None = None
    default_country: str | None = None
    persona: str | None = None
    user_timezone: str | None = None
    measurement_units: str | None = None
    language: str | None = None
    currency: str | None = None
    date_format: str | None = None
    time_format: str | None = None
    commercial_holidays: str | None = None
    commercial_check_open_now: bool | None = None
    transport_preferences: list[str] | None = None
    cuisine_preferences: list[str] | None = None
    current_date: str | None = None
    current_time: str | None = None
    current_weekday: str | None = None
    smarthome_light: dict[str, Any] | None = None
    smarthome_climate: dict[str, Any] | None = None
