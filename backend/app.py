from contextlib import asynccontextmanager
from fastapi import FastAPI
from routes.satellite_routes import router
import logging
import os
from exceptions.custom_exceptions import SatelliteNotFoundException, TLEDownloadException, PassPredictionUnavailableException
from exceptions.handlers import satellite_not_found_exception_handler, tle_download_exception_handler, pass_prediction_unavailable_exception_handler, global_exception_handler
from middleware.logging_middleware import logging_middleware
from routes.auth_routes import router as auth_router
from exceptions.auth_exceptions import UserAlreadyExistsException, InvalidCredentialsException
from exceptions.handlers import user_exists_handler, invalid_credentials_handler
from database.init_db import create_tables
from routes.favorite_routes import router as favorite_router
from routes.location_routes import router as location_router
from exceptions.favorite_exceptions import (
    FavoriteAlreadyExistsException,
    FavoriteNotFoundException
)
from exceptions.handlers import (
    favorite_already_exists_handler,
    favorite_not_found_handler
)
import asyncio
from services.service_instances import satellite_service
from routes.pass_alert_routes import router as pass_alert_router
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig (
    level = logging.INFO,
    format = "%(levelname)s: %(name)s: %(message)s"
)

async def tle_refresh_loop():
    while True:
        await asyncio.to_thread (
            satellite_service.refresh_tle_data
        )
        await asyncio.sleep(60 * 60 * 6)

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    if os.getenv("TESTING") != "1":
        asyncio.create_task(tle_refresh_loop())

    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://orbitscope-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler (
    SatelliteNotFoundException,
    satellite_not_found_exception_handler
)

app.add_exception_handler (
    TLEDownloadException,
    tle_download_exception_handler
)   

app.add_exception_handler(
    PassPredictionUnavailableException,
    pass_prediction_unavailable_exception_handler
)

@app.get("/")
def home():
    return {
        "message": "Welcome to OrbitScope 🚀"
    }

app.include_router(router)
app.add_exception_handler(
    Exception,
    global_exception_handler
)

@app.middleware("http")
async def log_requests(request, call_next):
    return await logging_middleware (request, call_next)

app.include_router(auth_router)

app.add_exception_handler(
    UserAlreadyExistsException,
    user_exists_handler
)

app.add_exception_handler(
    InvalidCredentialsException,
    invalid_credentials_handler
)

app.include_router(favorite_router)

app.include_router(location_router)

app.include_router(pass_alert_router)

app.add_exception_handler(
    FavoriteAlreadyExistsException,
    favorite_already_exists_handler
)

app.add_exception_handler(
    FavoriteNotFoundException,
    favorite_not_found_handler
)