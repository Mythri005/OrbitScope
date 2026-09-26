import sys
from pathlib import Path
import os

os.environ["TESTING"] = "1"

sys.path.insert(
    0,
    str(Path(__file__).resolve().parent.parent)
)

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app import app
from database.database import Base
from database.session import get_db
from routes.satellite_routes import get_satellite_service
from models.historical_tracking import HistoricalTracking
from services.historical_tracking_service import HistoricalTrackingService
from exceptions.custom_exceptions import SatelliteNotFoundException

TEST_DATABASE_URL = "sqlite:///./test_users.db"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine
)

class FakeSatelliteService:
    
    def __init__(self):
        self.last_hours = None

    def get_current_position(self, satellite_name):
        return {
            "name": satellite_name,
            "latitude": 10.0,
            "longitude": 20.0,
            "altitude": 400.0
        }

    def get_all_satellites(self):
        return ["ISS (ZARYA)", "POISK", "CSS (TIANHE)"]

    def get_satellite_categories(self):
        satellites = self.get_all_satellites()
        categories = {
            "stations": [],
            "weather": [],
            "gps": [],
            "communication": [],
            "other": []
        }
        for satellite in satellites:
            name = satellite.lower()
            if any(keyword in name for keyword in [
                "iss", "space station", "tiangong"
            ]):
                categories["stations"].append(satellite)
            elif any(keyword in name for keyword in [
                "noaa", "goes", "meteosat", "weather"
            ]):
                categories["weather"].append(satellite)
            elif any(keyword in name for keyword in [
                "gps", "navstar", "glonass", "galileo", "beidou"
            ]):
                categories["gps"].append(satellite)
            elif any(keyword in name for keyword in [
                "iridium", "starlink", "oneweb", "intelsat",
                "inmarsat", "globalstar"
            ]):
                categories["communication"].append(satellite)
            else:
                categories["other"].append(satellite)
        return categories

    def search_satellites(self, search_name):
        return ["ISS (ZARYA)"]

    def get_orbit_prediction(self, satellite_name, duration, interval):
        return {
            "name": satellite_name,
            "positions": []
        }
    
    def get_orbit_analytics(self, satellite_name, duration, interval):
        return {
            "name": satellite_name,
            "duration_minutes": duration,
            "point_count": 3,
            "min_altitude": 400.0,
            "max_altitude": 410.0,
            "average_altitude": 405.0,
            "min_latitude": 10.0,
            "max_latitude": 20.0,
            "min_longitude": 20.0,
            "max_longitude": 30.0,
            "estimated_orbital_period_minutes": 92.9
        }

    def get_ground_track(self, satellite_name, duration, interval):
        return {
            "name": satellite_name,
            "points": [
                {
                    "time": "2026-08-09T10:00:00Z",
                    "latitude": 10.0,
                    "longitude": 20.0
                },
                {
                    "time": "2026-08-09T10:05:00Z",
                    "latitude": 15.0,
                    "longitude": 25.0
                },
                {
                    "time": "2026-08-09T10:10:00Z",
                    "latitude": 20.0,
                    "longitude": 30.0
                },
                {
                    "time": "2026-08-09T10:15:00Z",
                    "latitude": 25.0,
                    "longitude": 35.0
                },
                {
                    "time": "2026-08-09T10:20:00Z",
                    "latitude": 30.0,
                    "longitude": 40.0
                }
            ]
        }

    def get_satellite_details(self, satellite_name):
        return {
            "name": satellite_name,
            "norad_id": 25544,
            "inclination": 51.6,
            "eccentricity": 0.0001,
            "mean_motion": 15.5,
            "orbital_period": 92.9,
            "epoch": "2026-08-09T00:00:00Z"
        }

    def get_pass_prediction(self, satellite_name, latitude, longitude, min_elevation=0.0, hours=24, sort_by="time", limit=10):
        passes = [
            {
                "rise_time": "2026-08-09T10:00:00Z",
                "culmination_time": "2026-08-09T10:05:00Z",
                "set_time": "2026-08-09T10:10:00Z",
                "max_elevation": 45.0,
                "duration_minutes": 10.0,
                "visibility": "High",
                "quality": "Good",
                "is_sunlit": True,
                "is_observer_in_darkness": True,
                "recommendation": "Recommended"
            },
            {
                "rise_time": "2026-08-09T15:00:00Z",
                "culmination_time": "2026-08-09T15:06:00Z",
                "set_time": "2026-08-09T15:12:00Z",
                "max_elevation": 32.0,
                "duration_minutes": 12.0,
                "visibility": "High",
                "quality": "Good",
                "is_sunlit": True,
                "is_observer_in_darkness": True,
                "recommendation": "Recommended"
            }
        ]

        passes = passes[:limit]

        return {
            "name": satellite_name,
            "best_pass_index": 0,
            "best_pass": passes[0],
            "passes": passes
        }

    def get_pass_calendar(self, satellite_name, latitude, longitude, days=7, min_elevation=0.0):
        return {
            "name": satellite_name,
            "days": days,
            "passes": []
        }

    def get_best_satellite(self, satellite_names, latitude, longitude, hours=24, min_elevation=0.0):
        return {
            "satellite_name": satellite_names[0],
            "pass_details": {
                "rise_time": "2026-08-09T10:00:00Z",
                "culmination_time": "2026-08-09T10:05:00Z",
                "set_time": "2026-08-09T10:10:00Z",
                "max_elevation": 45.0,
                "duration_minutes": 10.0,
                "visibility": "High",
                "quality": "Good",
                "is_sunlit": True,
                "is_observer_in_darkness": True,
                "recommendation": "Recommended"
            },
            "score": 90.0,
            "reason": "Best pass based on elevation and visibility"
        }

    def compare_satellites(self, satellite_names):
        if not satellite_names:
            raise SatelliteNotFoundException("No satellites provided")
        valid_satellites = self.get_all_satellites()
        comparisons = []
        for satellite_name in satellite_names:
            matched_satellite = None
            for valid_name in valid_satellites:
                if satellite_name.lower() in valid_name.lower():
                    matched_satellite = valid_name
                    break
            if matched_satellite is None:
                raise SatelliteNotFoundException(satellite_name)
            comparisons.append({
                "name": matched_satellite,
                "norad_id": 25544,
                "inclination": 51.6,
                "eccentricity": 0.0001,
                "mean_motion": 15.5,
                "orbital_period": 92.9,
                "epoch": "2026-08-09T00:00:00Z"
            })
        return {
            "satellites": comparisons
        }

@pytest.fixture
def client():
    Base.metadata.create_all(bind=test_engine)
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_satellite_service] = (
        lambda: FakeSatelliteService()
    )
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def historical_service():
    return HistoricalTrackingService(
        FakeSatelliteService()
    )

@pytest.fixture
def auth_headers(client):
    email = "locationuser@example.com"
    password = "TestPassword123"
    register_response = client.post(
        "/register",
        json={
            "email": email,
            "password": password
        }
    )
    assert register_response.status_code == 200
    login_response = client.post(
        "/login",
        data={
            "username": email,
            "password": password
        }
    )
    assert login_response.status_code == 200
    access_token = login_response.json()["access_token"]
    return {
        "Authorization": f"Bearer {access_token}"
    }