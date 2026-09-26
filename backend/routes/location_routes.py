from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.session import get_db
from schemas.observer_location import (
    ObserverLocationCreate,
    ObserverLocationResponse
)
from services.observer_location_service import ObserverLocationService
from utils.auth import get_current_user
from datetime import date, datetime, timezone
from services.service_instances import night_planner_service

router = APIRouter(
    prefix="/locations",
    tags=["Locations"]
)

@router.post(
    "",
    response_model=ObserverLocationResponse
)
def create_location(
    location_data: ObserverLocationCreate,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ObserverLocationService()
    return service.create_location(
        location_data,
        current_user,
        db
    )

@router.get(
    "",
    response_model=List[ObserverLocationResponse]
)
def get_locations(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ObserverLocationService()
    return service.get_locations(
        current_user,
        db
    )

@router.get(
    "/{location_id}",
    response_model=ObserverLocationResponse
)
def get_location(
    location_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ObserverLocationService()
    location = service.get_location(
        location_id,
        current_user,
        db
    )
    if location is None:
        raise HTTPException(
            status_code=404,
            detail="Observer location not found."
        )
    return location

@router.get(
    "/{location_id}/night"
)
def get_night_planner(
    location_id: int,
    date: date | None = None,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    location_service = ObserverLocationService()
    location = location_service.get_location(
        location_id,
        current_user,
        db
    )
    if location is None:
        raise HTTPException(
            status_code=404,
            detail="Observer location not found."
        )
    requested_date = (
        date.isoformat()
        if date is not None
        else datetime.now(timezone.utc).strftime("%Y-%m-%d")
    )
    return night_planner_service.get_night_planner(
        location_id=location.id,
        location_name=location.name,
        latitude=location.latitude,
        longitude=location.longitude,
        date=requested_date
    )

@router.delete(
    "/{location_id}"
)
def delete_location(
    location_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ObserverLocationService()
    deleted = service.delete_location(
        location_id,
        current_user,
        db
    )
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Observer location not found."
        )
    return {
        "message": "Observer location deleted successfully"
    }