from datetime import datetime
from pydantic import BaseModel

class NightPlannerResponse(BaseModel):
    location_id: int
    location_name: str
    date: str
    sunset: datetime
    civil_twilight_end: datetime
    nautical_twilight_end: datetime
    astronomical_twilight_end: datetime
    astronomical_twilight_begin: datetime
    nautical_twilight_begin: datetime
    civil_twilight_begin: datetime
    sunrise: datetime
    darkness_duration_minutes: float
    is_dark_now: bool