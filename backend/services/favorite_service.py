from sqlalchemy.orm import Session
from models.db_user import DBUser
from models.favorite_satellite import FavoriteSatellite
from exceptions.favorite_exceptions import (
    FavoriteAlreadyExistsException,
    FavoriteNotFoundException
)

class FavoriteService:

    def add_favorite(
        self,
        satellite_name: str,
        current_user: str,
        db: Session
    ):
        user = (
            db.query(DBUser)
            .filter(DBUser.email == current_user)
            .first()
        )
        existing_favorite = (
            db.query(FavoriteSatellite)
            .filter(
                FavoriteSatellite.user_id == user.id,
                FavoriteSatellite.satellite_name == satellite_name
            )
            .first()
        )
        if existing_favorite:
            # We'll replace this with a custom exception in the next step.
            raise FavoriteAlreadyExistsException()
        favorite = FavoriteSatellite(
            satellite_name=satellite_name,
            user_id=user.id
        )
        db.add(favorite)
        db.commit()
        db.refresh(favorite)
        return favorite

    def get_favorites(
        self,
        current_user: str,
        db: Session
    ):
        user = (
            db.query(DBUser)
            .filter(DBUser.email == current_user)
            .first()
        )

        return user.favorites

    def delete_favorite(
        self,
        satellite_name: str,
        current_user: str,
        db: Session
    ):
        user = (
            db.query(DBUser)
            .filter(DBUser.email == current_user)
            .first()
        )
        favorite = (
            db.query(FavoriteSatellite)
            .filter(
                FavoriteSatellite.user_id == user.id,
                FavoriteSatellite.satellite_name == satellite_name
            )
            .first()
        )
        if favorite is None:
            raise FavoriteNotFoundException()
        db.delete(favorite)
        db.commit()
        return {
            "message": "Favorite deleted successfully"
        }