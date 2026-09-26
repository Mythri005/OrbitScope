def test_get_orbit_analytics(client, auth_headers):
    response = client.get(
        "/satellites/ISS (ZARYA)/analytics",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ISS (ZARYA)"
    assert data["duration_minutes"] == 90
    assert data["point_count"] > 0
    assert "min_altitude" in data
    assert "max_altitude" in data
    assert "average_altitude" in data
    assert "min_latitude" in data
    assert "max_latitude" in data
    assert "min_longitude" in data
    assert "max_longitude" in data
    assert "estimated_orbital_period_minutes" in data

def test_get_orbit_analytics_custom_parameters(client, auth_headers):
    response = client.get(
        "/satellites/ISS (ZARYA)/analytics"
        "?duration=60&interval=10",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ISS (ZARYA)"
    assert data["duration_minutes"] == 60
    assert data["point_count"] > 0

def test_get_orbit_analytics_requires_auth(client):
    response = client.get(
        "/satellites/ISS (ZARYA)/analytics"
    )
    assert response.status_code in (401, 403)

def test_get_orbit_analytics_invalid_duration(client, auth_headers):
    response = client.get(
        "/satellites/ISS (ZARYA)/analytics"
        "?duration=0",
        headers=auth_headers
    )
    assert response.status_code == 422

def test_get_orbit_analytics_invalid_interval(client, auth_headers):
    response = client.get(
        "/satellites/ISS (ZARYA)/analytics"
        "?interval=0",
        headers=auth_headers
    )
    assert response.status_code == 422