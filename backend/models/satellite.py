from pydantic import BaseModel
from datetime import datetime

class SatelliteResponse(BaseModel):
    name: str
    latitude: float
    longitude: float
    altitude: float

class SatelliteListResponse(BaseModel):
    count: int
    satellites: list[str]

class OrbitPoint(BaseModel):
    time: datetime
    latitude: float
    longitude: float
    altitude: float

class OrbitResponse(BaseModel):
    name: str
    positions: list[OrbitPoint]

class SatelliteDetailsResponse(BaseModel):
    name: str
    norad_id: int
    inclination: float
    eccentricity: float
    mean_motion: float
    orbital_period: float
    epoch: datetime

class SatellitePass(BaseModel):
    rise_time: datetime
    culmination_time: datetime
    set_time: datetime
    max_elevation: float
    duration_minutes: float
    visibility: str
    quality: str
    is_sunlit: bool
    is_observer_in_darkness: bool
    recommendation: str

class PassPredictionResponse(BaseModel):
    name: str
    passes: list[SatellitePass]
    best_pass_index: int
    best_pass: SatellitePass

class PassCalendarResponse(BaseModel):
    name: str
    days: int
    passes: list[SatellitePass]

class GroundTrackPoint(BaseModel):
    time: datetime
    latitude: float
    longitude: float

class GroundTrackResponse(BaseModel):
    name: str
    points: list[GroundTrackPoint]

class MultiSatelliteTrackingResponse(BaseModel):
    satellites: list[SatelliteResponse]

class BestSatelliteResponse(BaseModel):
    satellite_name: str
    pass_details: SatellitePass
    score: float
    reason: str

class OrbitAnalyticsResponse(BaseModel):
    name: str
    duration_minutes: int
    point_count: int
    min_altitude: float
    max_altitude: float
    average_altitude: float
    min_latitude: float
    max_latitude: float
    min_longitude: float
    max_longitude: float
    estimated_orbital_period_minutes: float

class HistoricalTrackingResponse(BaseModel):
    satellite_name: str
    timestamp: datetime
    latitude: float
    longitude: float
    altitude: float

class SatelliteComparisonItem(BaseModel):
    name: str
    norad_id: int
    inclination: float
    eccentricity: float
    mean_motion: float
    orbital_period: float
    epoch: datetime


class SatelliteComparisonResponse(BaseModel):
    satellites: list[SatelliteComparisonItem]