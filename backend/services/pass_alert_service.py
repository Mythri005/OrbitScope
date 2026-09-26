from sqlalchemy.orm import Session
from models.db_user import DBUser
from models.observer_location import ObserverLocation
from models.pass_alert import PassAlert
from schemas.pass_alert import PassAlertCreate

class PassAlertService:

    def create_alert(self, alert_data: PassAlertCreate, current_user: str, db: Session):
        user = (
            db.query(DBUser)
            .filter(DBUser.email == current_user)
            .first()
        )
        location = (
            db.query(ObserverLocation)
            .filter(
                ObserverLocation.id == alert_data.location_id,
                ObserverLocation.user_id == user.id
            )
            .first()
        )
        if location is None:
            return None
        alert = PassAlert(
            satellite_name=alert_data.satellite_name,
            user_id=user.id,
            location_id=alert_data.location_id,
            min_elevation=alert_data.min_elevation,
            enabled=True
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert

    def get_alerts(self, current_user: str, db: Session):
        user = (
            db.query(DBUser)
            .filter(DBUser.email == current_user)
            .first()
        )
        return (
            db.query(PassAlert)
            .filter(PassAlert.user_id == user.id)
            .all()
        )

    def get_alert(self, alert_id: int, current_user: str, db: Session):
        user = (
            db.query(DBUser)
            .filter(DBUser.email == current_user)
            .first()
        )
        return (
            db.query(PassAlert)
            .filter(
                PassAlert.id == alert_id,
                PassAlert.user_id == user.id
            )
            .first()
        )

    def set_alert_enabled(self, alert_id: int, enabled: bool, current_user: str, db: Session):
        alert = self.get_alert(
            alert_id,
            current_user,
            db
        )
        if alert is None:
            return None
        alert.enabled = enabled
        db.commit()
        db.refresh(alert)
        return alert

    def delete_alert(self, alert_id: int, current_user: str,db: Session):
        alert = self.get_alert(
            alert_id,
            current_user,
            db
        )
        if alert is None:
            return False
        db.delete(alert)
        db.commit()
        return True