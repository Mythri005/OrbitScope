from sqlalchemy.orm import Session
from models.db_user import DBUser
from models.observer_location import ObserverLocation
from schemas.observer_location import ObserverLocationCreate

class ObserverLocationService:

    def create_location(
        self,
        location_data: ObserverLocationCreate,
        current_user: str,
        db: Session
    ):
        user = (
            db.query(DBUser)
            .filter(DBUser.email == current_user)
            .first()
        )
        location = ObserverLocation(
            name=location_data.name,
            latitude=location_data.latitude,
            longitude=location_data.longitude,
            user_id=user.id
        )
        db.add(location)
        db.commit()
        db.refresh(location)
        return location

    def get_locations(
        self,
        current_user: str,
        db: Session
    ):
        user = (
            db.query(DBUser)
            .filter(DBUser.email == current_user)
            .first()
        )
        return user.locations

    def get_location(
        self,
        location_id: int,
        current_user: str,
        db: Session
    ):
        user = (
            db.query(DBUser)
            .filter(DBUser.email == current_user)
            .first()
        )
        return (
            db.query(ObserverLocation)
            .filter(
                ObserverLocation.id == location_id,
                ObserverLocation.user_id == user.id
            )
            .first()
        )

    def delete_location(
        self,
        location_id: int,
        current_user: str,
        db: Session
    ):
        user = (
            db.query(DBUser)
            .filter(DBUser.email == current_user)
            .first()
        )
        location = (
            db.query(ObserverLocation)
            .filter(
                ObserverLocation.id == location_id,
                ObserverLocation.user_id == user.id
            )
            .first()
        )
        if location is None:
            return False

        db.delete(location)
        db.commit()
        return True