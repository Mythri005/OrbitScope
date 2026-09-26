def authenticate(client):
    client.post(
        "/register",
        json={
            "email": "comparisonuser@example.com",
            "password": "TestPassword123"
        }
    )
    response = client.post(
        "/login",
        data={
            "username": "comparisonuser@example.com",
            "password": "TestPassword123"
        }
    )
    return response.json()["access_token"]

def test_compare_two_satellites(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/compare"
        "?satellite_names=ISS"
        "&satellite_names=CSS%20%28TIANHE%29",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "satellites" in data
    assert len(data["satellites"]) == 2
    first = data["satellites"][0]
    second = data["satellites"][1]
    assert first["name"] == "ISS (ZARYA)"
    assert second["name"] == "CSS (TIANHE)"
    assert "norad_id" in first
    assert "inclination" in first
    assert "eccentricity" in first
    assert "mean_motion" in first
    assert "orbital_period" in first
    assert "epoch" in first

def test_compare_multiple_satellites(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/compare"
        "?satellite_names=ISS"
        "&satellite_names=CSS%20%28TIANHE%29"
        "&satellite_names=POISK",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["satellites"]) == 3
    names = [
        satellite["name"]
        for satellite in data["satellites"]
    ]
    assert "ISS (ZARYA)" in names
    assert "CSS (TIANHE)" in names
    assert "POISK" in names

def test_compare_satellites_not_found(client):
    token = authenticate(client)
    response = client.get(
        "/satellites/compare"
        "?satellite_names=INVALID_SATELLITE",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404

def test_compare_satellites_requires_satellite_names(client):
    token = authenticate(client)

    response = client.get(
        "/satellites/compare",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422