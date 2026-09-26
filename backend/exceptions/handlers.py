from fastapi import Request
from fastapi.responses import JSONResponse
from exceptions.custom_exceptions import SatelliteNotFoundException, TLEDownloadException, PassPredictionUnavailableException
import logging
from fastapi.responses import JSONResponse
from exceptions.favorite_exceptions import (
    FavoriteAlreadyExistsException,
    FavoriteNotFoundException
)

async def satellite_not_found_exception_handler (
    request: Request,
    exc: SatelliteNotFoundException
):
    return JSONResponse (
        status_code = 404,
        content = {
            "detail": str(exc)
        }
    )

async def tle_download_exception_handler(
    request: Request,
    exc: TLEDownloadException
):
    return JSONResponse(
        status_code=503,
        content={
            "detail": str(exc)
        }
    )

async def pass_prediction_unavailable_exception_handler(
    request: Request,
    exc: PassPredictionUnavailableException
):
    return JSONResponse(
        status_code=404,
        content={
            "detail": str(exc)
        }
    )

logger = logging.getLogger(__name__)

async def global_exception_handler(
    request: Request,
    exc: Exception
):
    logger.exception(f"Unexpected error: {exc}")

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal Server Error. Please try again later."
        }
    )

from exceptions.auth_exceptions import (
    UserAlreadyExistsException,
    InvalidCredentialsException
)

async def user_exists_handler(request: Request, exc: UserAlreadyExistsException):
    return JSONResponse(
        status_code=409,
        content={"detail": "User already exists"}
    )

async def invalid_credentials_handler(request: Request, exc: InvalidCredentialsException):
    return JSONResponse(
        status_code=401,
        content={"detail": "Invalid email or password"}
    )

async def favorite_already_exists_handler(request, exc: FavoriteAlreadyExistsException):
    return JSONResponse(
        status_code=409,
        content={
            "detail": exc.message
        }
    )

async def favorite_not_found_handler(request, exc: FavoriteNotFoundException):
    return JSONResponse(
        status_code=404,
        content={
            "detail": exc.message
        }
    )