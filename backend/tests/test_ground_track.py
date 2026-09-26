def authenticate(client):
    client.post(
        "/register",
        json={
            "email": "groundtrackuser@example.com",
            "password": "TestPassword123"
        }
    )
    response = client.post(
        "/login",
        data={
            "username": "groundtrackuser@example.com",
            "password": "TestPassword123"
        }
    )
    return response.json()["access_token"]

def test_ground_track_points(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/ISS/ground-track",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    first_point = data["points"][0]
    assert first_point["latitude"] == 10.0
    assert first_point["longitude"] == 20.0
    assert "time" in first_point

def test_ground_track_point_count(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/ISS/ground-track",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["points"]) == 5

def test_ground_track_requires_authentication(client):
    response = client.get(
        "/satellites/ISS/ground-track"
    )
    assert response.status_code == 401

def test_ground_track_invalid_duration_low(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/ISS/ground-track?duration=0",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422

def test_ground_track_invalid_duration_high(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/ISS/ground-track?duration=1441",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422

def test_ground_track_invalid_interval_low(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/ISS/ground-track?interval=0",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422

def test_ground_track_invalid_interval_high(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/ISS/ground-track?interval=61",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422