def test_get_best_satellite(client, auth_headers):
    response = client.get(
        "/satellites/best",
        params={
            "satellite_names": [
                "ISS (ZARYA)",
                "POISK",
                "CSS (TIANHE)"
            ],
            "lat": 17.385,
            "lon": 78.4867,
            "hours": 24,
            "min_elevation": 10
        },
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "satellite_name" in data
    assert "pass_details" in data
    assert "score" in data
    assert "reason" in data

def test_get_best_satellite_requires_auth(client):
    response = client.get(
        "/satellites/best",
        params={
            "satellite_names": ["ISS (ZARYA)", "POISK"]
        }
    )
    assert response.status_code in [401, 403]

def test_get_best_satellite_requires_satellites(client, auth_headers):
    response = client.get(
        "/satellites/best",
        headers=auth_headers
    )
    assert response.status_code == 422

def test_get_best_satellite_validates_latitude(client, auth_headers):
    response = client.get(
        "/satellites/best",
        params={
            "satellite_names": ["ISS (ZARYA)"],
            "lat": 100
        },
        headers=auth_headers
    )
    assert response.status_code == 422

def test_get_best_satellite_validates_hours(client, auth_headers):
    response = client.get(
        "/satellites/best",
        params={
            "satellite_names": ["ISS (ZARYA)"],
            "hours": 25
        },
        headers=auth_headers
    )
    assert response.status_code == 422