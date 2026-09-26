def test_get_pass_calendar(client, auth_headers):
    response = client.get(
        "/satellites/ISS%20(ZARYA)/passes/calendar",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ISS (ZARYA)"
    assert data["days"] == 7
    assert data["passes"] == []

def test_get_pass_calendar_with_parameters(client, auth_headers):
    response = client.get(
        "/satellites/ISS%20(ZARYA)/passes/calendar",
        params={
            "lat": 17.3850,
            "lon": 78.4867,
            "days": 14,
            "min_elevation": 30
        },
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "ISS (ZARYA)"
    assert data["days"] == 14
    assert data["passes"] == []

def test_pass_calendar_requires_authentication(client):
    response = client.get(
        "/satellites/ISS%20(ZARYA)/passes/calendar"
    )
    assert response.status_code == 401

def test_pass_calendar_invalid_days_low(client, auth_headers):
    response = client.get(
        "/satellites/ISS%20(ZARYA)/passes/calendar",
        params={"days": 0},
        headers=auth_headers
    )
    assert response.status_code == 422

def test_pass_calendar_invalid_days_high(client, auth_headers):
    response = client.get(
        "/satellites/ISS%20(ZARYA)/passes/calendar",
        params={"days": 31},
        headers=auth_headers
    )
    assert response.status_code == 422