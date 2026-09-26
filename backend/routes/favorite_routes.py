from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.session import get_db
from schemas.favorite import FavoriteResponse
from services.favorite_service import FavoriteService
from utils.auth import get_current_user
from typing import List

router = APIRouter(
    prefix="/favorites",
    tags=["Favorites"]
)
@router.post(
    "/{satellite_name}",
    response_model=FavoriteResponse
)
def add_favorite(
    satellite_name: str,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = FavoriteService()
    return service.add_favorite(
        satellite_name,
        current_user,
        db
    )

@router.get(
    "",
    response_model=List[FavoriteResponse]
)
def get_favorites(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = FavoriteService()
    return service.get_favorites(
        current_user,
        db
    )

@router.delete("/{satellite_name}")
def delete_favorite(
    satellite_name: str,
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = FavoriteService()
    return service.delete_favorite(
        satellite_name,
        current_user,
        db
    )