from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class PassAlertCreate(BaseModel):
    satellite_name: str = Field(
        min_length=1,
        max_length=100
    )
    location_id: int
    min_elevation: float = Field(
        default=0.0,
        ge=0,
        le=90
    )

class PassAlertResponse(BaseModel):
    id: int
    satellite_name: str
    location_id: int
    min_elevation: float
    enabled: bool
    created_at: datetime
    model_config = ConfigDict(
        from_attributes=True
    )