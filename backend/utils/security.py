from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import jwt
from config.auth_config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

password_context = CryptContext (
    schemes = ["bcrypt"],
    deprecated = "auto"
)

def hash_password (password: str) -> str:
    return password_context.hash(password)

def verify_password (password:str, hashed_password: str) -> bool:
    return password_context.verify(password, hashed_password)

def create_access_token(data: dict) -> str:
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload["exp"] = expire
    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )