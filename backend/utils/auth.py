from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends
from jose import JWTError, jwt
from config.auth_config import SECRET_KEY, ALGORITHM
from exceptions.auth_exceptions import InvalidCredentialsException

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="login"
)

def get_current_user(
    token: str = Depends(oauth2_scheme)
):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        email = payload.get("sub")
        if email is None:
            raise InvalidCredentialsException()
        return email
    except JWTError:
        raise InvalidCredentialsException()