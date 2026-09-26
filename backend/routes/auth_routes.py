from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from services.auth_service import AuthService, get_auth_service
from schemas.auth import UserRegister, Token
from sqlalchemy.orm import Session
from database.session import get_db

router = APIRouter(tags=["Authentication"])

@router.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db),
    service: AuthService = Depends(get_auth_service)
):
    return service.register(user, db)


@router.post(
    "/login",
    response_model=Token
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
    service: AuthService = Depends(get_auth_service)
):
    return service.login(form_data, db)