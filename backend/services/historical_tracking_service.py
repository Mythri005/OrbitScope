from datetime import datetime, timezone
from sqlalchemy.orm import Session
from models.historical_tracking import HistoricalTracking
from models.satellite import HistoricalTrackingResponse
from services.satellite_service import SatelliteService


class HistoricalTrackingService:

    def __init__(self, satellite_service: SatelliteService):
        self.satellite_service = satellite_service

    def record_current_position(self, db: Session, satellite_name: str):
        position = self.satellite_service.get_current_position(
            satellite_name
        )
        historical_record = HistoricalTracking(
            satellite_name=position["name"],
            timestamp=datetime.now(timezone.utc),
            latitude=position["latitude"],
            longitude=position["longitude"],
            altitude=position["altitude"]
        )
        db.add(historical_record)
        db.commit()
        db.refresh(historical_record)
        return historical_record

    def get_historical_tracking(self, db: Session, satellite_name: str):
        position = self.satellite_service.get_current_position(
            satellite_name
        )
        canonical_name = position["name"]
        records = (
            db.query(HistoricalTracking)
            .filter(
                HistoricalTracking.satellite_name == canonical_name
            )
            .order_by(
                HistoricalTracking.timestamp.asc()
            )
            .all()
        )
        return records