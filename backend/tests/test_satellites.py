from routes.satellite_routes import get_satellite_service

class FakeSatelliteService:

    def get_current_position(self, satellite_name):
        return {
            "name": satellite_name,
            "latitude": 10.0,
            "longitude": 20.0,
            "altitude": 400.0
        }

    def get_all_satellites(self):
        return ["ISS (ZARYA)", "POISK", "CSS (TIANHE)"]

    def search_satellites(self, search_name):
        return ["ISS (ZARYA)"]

    def get_orbit_prediction(self, satellite_name, duration, interval):
        return {
            "name": satellite_name,
            "positions": []
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

    def get_pass_prediction(self, satellite_name, latitude, longitude):
        return {
            "name": satellite_name,
            "rise_time": "2026-08-09T10:00:00Z",
            "culmination_time": "2026-08-09T10:05:00Z",
            "set_time": "2026-08-09T10:10:00Z",
            "max_elevation": 45.0
        }

def authenticate(client):
    client.post(
        "/register",
        json={
            "email": "satelliteuser@example.com",
            "password": "TestPassword123"
        }
    )
    response = client.post(
        "/login",
        data={
            "username": "satelliteuser@example.com",
            "password": "TestPassword123"
        }
    )
    return response.json()["access_token"]

def test_get_satellite(client):
    token = authenticate(client)
    response = client.get(
        "/satellite/ISS",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ISS"
    assert data["latitude"] == 10.0
    assert data["longitude"] == 20.0
    assert data["altitude"] == 400.0

def test_get_all_satellites(client):
    token = authenticate(client)
    response = client.get(
        "/satellites",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 3
    assert "ISS (ZARYA)" in data["satellites"]

def test_search_satellites(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/search?name=ISS",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 1
    assert data["satellites"][0] == "ISS (ZARYA)"

def test_get_orbit(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/ISS/orbit?duration=90&interval=5",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ISS"
    assert data["positions"] == []

def test_get_satellite_details(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/ISS/details",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ISS"
    assert data["norad_id"] == 25544

def test_get_pass_prediction(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/ISS/pass?lat=34.56&lon=34.5",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ISS"
    assert len(data["passes"]) == 2
    first_pass = data["passes"][0]
    assert first_pass["rise_time"] == "2026-08-09T10:00:00Z"
    assert first_pass["culmination_time"] == "2026-08-09T10:05:00Z"
    assert first_pass["set_time"] == "2026-08-09T10:10:00Z"
    assert first_pass["max_elevation"] == 45.0
    assert first_pass["duration_minutes"] == 10.0
    assert first_pass["visibility"] == "High"
    assert first_pass["quality"] == "Good"
    assert first_pass["is_sunlit"] is True
    assert first_pass["is_observer_in_darkness"] is True

def test_get_pass_prediction_with_min_elevation(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/ISS/pass?lat=34.56&lon=34.5&min_elevation=30",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ISS"
    for satellite_pass in data["passes"]:
        assert satellite_pass["max_elevation"] >= 30

def test_get_pass_prediction_with_hours(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/ISS/pass?lat=34.56&lon=34.5&hours=6",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ISS"
    assert len(data["passes"]) == 2

def test_pass_prediction_hours_validation(client):
    token = authenticate(client)
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get(
        "/satellites/ISS/pass?lat=34.56&lon=34.5&hours=0",
        headers=headers
    )
    assert response.status_code == 422
    response = client.get(
        "/satellites/ISS/pass?lat=34.56&lon=34.5&hours=25",
        headers=headers
    )
    assert response.status_code == 422

def test_pass_prediction_invalid_latitude(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/ISS/pass?lat=91&lon=34.5",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422

def test_pass_prediction_invalid_longitude(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/ISS/pass?lat=34.5&lon=181",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422

def test_get_pass_prediction_sort_by_elevation(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/ISS/pass?lat=34.56&lon=34.5&sort_by=elevation",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ISS"
    assert len(data["passes"]) == 2
    first_pass = data["passes"][0]
    second_pass = data["passes"][1]
    assert first_pass["max_elevation"] >= second_pass["max_elevation"]

def test_pass_prediction_invalid_sort_by(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/ISS/pass?lat=34.56&lon=34.5&sort_by=invalid",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422

def test_get_pass_prediction_with_limit(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/ISS/pass?lat=34.56&lon=34.5&limit=1",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ISS"
    assert len(data["passes"]) == 1

def test_pass_prediction_invalid_limit(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/ISS/pass?lat=34.56&lon=34.5&limit=0",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422
    response = client.get(
        "/satellites/ISS/pass?lat=34.56&lon=34.5&limit=51",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422

def test_get_pass_prediction_combined_filters(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/ISS/pass"
        "?lat=34.56"
        "&lon=34.5"
        "&min_elevation=30"
        "&hours=24"
        "&sort_by=elevation"
        "&limit=1",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ISS"
    assert len(data["passes"]) == 1
    selected_pass = data["passes"][0]
    assert selected_pass["max_elevation"] >= 30

def test_get_satellite_categories(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/categories",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "stations" in data
    assert "weather" in data
    assert "gps" in data
    assert "communication" in data
    assert "other" in data