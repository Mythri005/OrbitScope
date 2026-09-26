from fastapi import APIRouter, Query, Depends
from services.satellite_service import SatelliteService
from services.service_instances import satellite_service
from models.satellite import (
    SatelliteResponse,
    SatelliteListResponse,
    OrbitResponse,
    GroundTrackResponse,
    SatelliteDetailsResponse,
    PassPredictionResponse,
    PassCalendarResponse,
    MultiSatelliteTrackingResponse,
    BestSatelliteResponse,
    OrbitAnalyticsResponse,
    SatelliteComparisonResponse
)
from database.session import get_db
from sqlalchemy.orm import Session
from utils.auth import get_current_user
from models.historical_tracking import HistoricalTracking
from services.service_instances import historical_tracking_service

router = APIRouter()

def get_satellite_service():
    return satellite_service

@router.get(
    "/satellite/{satellite_name}",
    response_model=SatelliteResponse
)
def get_satellite(
    satellite_name: str,
    current_user: str = Depends(get_current_user),
    service: SatelliteService = Depends(get_satellite_service)
):
    return service.get_current_position(satellite_name)

@router.get(
    "/satellites/tracking",
    response_model=MultiSatelliteTrackingResponse
)
def get_multi_satellite_tracking(
    satellite_names: list[str] = Query(
        ...,
        description="List of satellite names to track"
    ),
    current_user: str = Depends(get_current_user),
    service: SatelliteService = Depends(get_satellite_service)
):
    return service.get_multi_satellite_tracking(satellite_names)

@router.get (
        "/satellites",
        response_model = SatelliteListResponse
)
def get_all_satellites(
    current_user: str = Depends(get_current_user),
    service: SatelliteService = Depends(get_satellite_service)
):
    satellites = service.get_all_satellites()
    return {
        "count": len(satellites),
        "satellites": satellites
    }

@router.get(
        "/satellites/search",
        response_model = SatelliteListResponse
)
def search_satellites(
    name: str,
    current_user: str = Depends(get_current_user),
    service: SatelliteService = Depends(get_satellite_service)
):
    results = service.search_satellites(name)
    return {
        "count": len(results),
        "satellites": results
    }

@router.get(
    "/satellites/{satellite_name}/orbit",
    response_model = OrbitResponse
)
def get_orbit(
    satellite_name: str, 
    duration: int = Query (
        default = 90,
        ge = 1,
        le =1440,
        description = "prediction duration in minues"
    ),
    interval: int = Query (
        default = 5,
        ge = 1,
        le = 60,
        description = "Time interval between orbit points in minutes"
    ),
    current_user: str = Depends(get_current_user),
    service: SatelliteService = Depends(get_satellite_service)
):
    return service.get_orbit_prediction(
        satellite_name,
        duration,
        interval
    )

@router.get(
    "/satellites/{satellite_name}/analytics",
    response_model=OrbitAnalyticsResponse
)
def get_orbit_analytics(
    satellite_name: str,
    duration: int = Query(
        default=90,
        ge=1,
        le=1440,
        description="Prediction duration in minutes"
    ),
    interval: int = Query(
        default=5,
        ge=1,
        le=60,
        description="Time interval between orbit points in minutes"
    ),
    current_user: str = Depends(get_current_user),
    service: SatelliteService = Depends(get_satellite_service)
):
    return service.get_orbit_analytics(
        satellite_name,
        duration,
        interval
    )

@router.get(
    "/satellites/{satellite_name}/ground-track",
    response_model=GroundTrackResponse
)
def get_ground_track(
    satellite_name: str,
    duration: int = Query(
        default=90,
        ge=1,
        le=1440,
        description="Ground track prediction duration in minutes"
    ),
    interval: int = Query(
        default=5,
        ge=1,
        le=60,
        description="Time interval between ground track points in minutes"
    ),
    current_user: str = Depends(get_current_user),
    service: SatelliteService = Depends(get_satellite_service)
):
    return service.get_ground_track(
        satellite_name,
        duration,
        interval
    )

@router.get("/satellites/{satellite_name}/details",
             response_model = SatelliteDetailsResponse
)
def get_satellite_details(
    satellite_name: str,
    current_user: str = Depends(get_current_user),
    service: SatelliteService = Depends(get_satellite_service)
):
    return service.get_satellite_details(satellite_name)

@router.get(
    "/satellites/{satellite_name}/pass",
    response_model=PassPredictionResponse
)
def get_pass_prediction(
    satellite_name: str,
    lat: float = Query(
        default=0.0,
        ge=-90,
        le=90,
        description="Observer latitude"
    ),
    lon: float = Query(
        default=0.0,
        ge=-180,
        le=180,
        description="Observer longitude"
    ),
    min_elevation: float = Query(
        default=0.0,
        ge=0,
        le=90,
        description="Minimum pass elevation in degrees"
    ),
    hours: int = Query(
        default=24,
        ge=1,
        le=24,
        description="Prediction window in hours"
    ),
    sort_by: str = Query(
        default="time",
        pattern="^(time|elevation)$",
        description="Sort passes by time or elevation"
    ),
    limit: int = Query(
        default=10,
        ge=1,
        le=50,
        description="Maximum number of passes to return"
    ),
    current_user: str = Depends(get_current_user),
    service: SatelliteService = Depends(get_satellite_service)
):
    return service.get_pass_prediction(
        satellite_name,
        lat,
        lon,
        min_elevation,
        hours,
        sort_by,
        limit
    )

@router.get(
    "/satellites/{satellite_name}/passes/calendar",
    response_model=PassCalendarResponse
)
def get_pass_calendar(
    satellite_name: str,
    lat: float = Query(
        default=0.0,
        ge=-90,
        le=90,
        description="Observer latitude"
    ),
    lon: float = Query(
        default=0.0,
        ge=-180,
        le=180,
        description="Observer longitude"
    ),
    days: int = Query(
        default=7,
        ge=1,
        le=30,
        description="Number of days to predict"
    ),
    min_elevation: float = Query(
        default=0.0,
        ge=0,
        le=90,
        description="Minimum pass elevation in degrees"
    ),
    current_user: str = Depends(get_current_user),
    service: SatelliteService = Depends(get_satellite_service)
):
    return service.get_pass_calendar(
        satellite_name=satellite_name,
        latitude=lat,
        longitude=lon,
        days=days,
        min_elevation=min_elevation
    )

@router.get(
    "/satellites/best",
    response_model=BestSatelliteResponse
)
def get_best_satellite(
    satellite_names: list[str] = Query(
        ...,
        description="List of satellite names to compare"
    ),
    lat: float = Query(
        default=0.0,
        ge=-90,
        le=90,
        description="Observer latitude"
    ),
    lon: float = Query(
        default=0.0,
        ge=-180,
        le=180,
        description="Observer longitude"
    ),
    hours: int = Query(
        default=24,
        ge=1,
        le=24,
        description="Prediction window in hours"
    ),
    min_elevation: float = Query(
        default=0.0,
        ge=0,
        le=90,
        description="Minimum pass elevation in degrees"
    ),
    current_user: str = Depends(get_current_user),
    service: SatelliteService = Depends(get_satellite_service)
):
    return service.get_best_satellite(
        satellite_names=satellite_names,
        latitude=lat,
        longitude=lon,
        hours=hours,
        min_elevation=min_elevation
    )

@router.get(
    "/satellites/{satellite_name}/history"
)
def get_historical_tracking(
    satellite_name: str,
    current_user: str = Depends(get_current_user)
):
    return historical_tracking_service.get_historical_tracking(
        db=next(get_db()),
        satellite_name=satellite_name
    )

@router.post(
    "/satellites/{satellite_name}/history"
)
def record_historical_tracking(
    satellite_name: str,
    current_user: str = Depends(get_current_user)
):
    return historical_tracking_service.record_current_position(
        db=next(get_db()),
        satellite_name=satellite_name
    )

@router.get("/satellites/categories")
def get_satellite_categories(
    current_user: str = Depends(get_current_user),
    service: SatelliteService = Depends(get_satellite_service)
):
    return service.get_satellite_categories()

@router.get(
    "/satellites/compare",
    response_model=SatelliteComparisonResponse
)
def compare_satellites(
    satellite_names: list[str] = Query(
        ...,
        description="List of satellite names to compare"
    ),
    current_user: str = Depends(get_current_user),
    service: SatelliteService = Depends(get_satellite_service)
):
    return service.compare_satellites(satellite_names)