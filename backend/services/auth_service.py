from schemas.auth import UserRegister
from utils.security import hash_password
from utils.security import verify_password
from exceptions.auth_exceptions import UserAlreadyExistsException, InvalidCredentialsException
from utils.security import (
    verify_password,
    create_access_token
)
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from models.db_user import DBUser

class AuthService:

    def register(self, user: UserRegister, db: Session):
        existing_user = (
            db.query(DBUser)
            .filter(DBUser.email == user.email)
            .first()
        )
        if existing_user:
            raise UserAlreadyExistsException()
        hashed_password = hash_password(user.password)
        new_user = DBUser(
            email=user.email,
            hashed_password=hashed_password
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {
            "message": "User registered successfully"
        }

    def login(self, form_data: OAuth2PasswordRequestForm, db: Session):
        existing_user = (
            db.query(DBUser)
            .filter(DBUser.email == form_data.username)
            .first()
        )
        if existing_user is None:
            raise InvalidCredentialsException()
        if not verify_password (
            form_data.password,
            existing_user.hashed_password
        ):
            raise InvalidCredentialsException()
        access_token = create_access_token(
            {
                "sub": existing_user.email
            }
        )
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }

auth_service = AuthService()

def get_auth_service():
    return auth_service