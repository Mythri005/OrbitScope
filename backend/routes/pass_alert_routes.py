from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.session import get_db
from schemas.pass_alert import (
    PassAlertCreate,
    PassAlertResponse
)
from services.pass_alert_service import PassAlertService
from utils.auth import get_current_user
from typing import List

router = APIRouter(
    prefix="/alerts",
    tags=["Pass Alerts"]
)

@router.post(
    "",
    response_model=PassAlertResponse
)
def create_alert(
    alert_data: PassAlertCreate,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PassAlertService()
    alert = service.create_alert(
        alert_data,
        current_user,
        db
    )
    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Observer location not found."
        )
    return alert

@router.get(
    "",
    response_model=List[PassAlertResponse]
)
def get_alerts(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PassAlertService()
    return service.get_alerts(
        current_user,
        db
    )

@router.patch(
    "/{alert_id}",
    response_model=PassAlertResponse
)
def update_alert(
    alert_id: int,
    enabled: bool,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PassAlertService()
    alert = service.set_alert_enabled(
        alert_id,
        enabled,
        current_user,
        db
    )
    if alert is None:
        raise HTTPException(
            status_code=404,
            detail="Pass alert not found."
        )
    return alert

@router.delete(
    "/{alert_id}"
)
def delete_alert(
    alert_id: int,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = PassAlertService()
    deleted = service.delete_alert(
        alert_id,
        current_user,
        db
    )
    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Pass alert not found."
        )
    return {
        "message": "Pass alert deleted successfully"
    }