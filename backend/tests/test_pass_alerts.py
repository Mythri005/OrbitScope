def test_create_pass_alert(client, auth_headers):
    location_response = client.post(
        "/locations",
        json={
            "name": "Hyderabad",
            "latitude": 17.3850,
            "longitude": 78.4867
        },
        headers=auth_headers
    )
    assert location_response.status_code == 200
    location_id = location_response.json()["id"]
    response = client.post(
        "/alerts",
        json={
            "satellite_name": "ISS (ZARYA)",
            "location_id": location_id,
            "min_elevation": 30
        },
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["satellite_name"] == "ISS (ZARYA)"
    assert data["location_id"] == location_id
    assert data["min_elevation"] == 30
    assert data["enabled"] is True
    assert "id" in data
    assert "created_at" in data

def test_get_pass_alerts(client, auth_headers):
    location_response = client.post(
        "/locations",
        json={
            "name": "Hyderabad",
            "latitude": 17.3850,
            "longitude": 78.4867
        },
        headers=auth_headers
    )
    location_id = location_response.json()["id"]
    client.post(
        "/alerts",
        json={
            "satellite_name": "ISS (ZARYA)",
            "location_id": location_id,
            "min_elevation": 20
        },
        headers=auth_headers
    )
    response = client.get(
        "/alerts",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["satellite_name"] == "ISS (ZARYA)"
    assert data[0]["location_id"] == location_id

def test_enable_disable_pass_alert(client, auth_headers):
    location_response = client.post(
        "/locations",
        json={
            "name": "Hyderabad",
            "latitude": 17.3850,
            "longitude": 78.4867
        },
        headers=auth_headers
    )
    location_id = location_response.json()["id"]
    create_response = client.post(
        "/alerts",
        json={
            "satellite_name": "ISS (ZARYA)",
            "location_id": location_id,
            "min_elevation": 30
        },
        headers=auth_headers
    )
    alert_id = create_response.json()["id"]
    response = client.patch(
        f"/alerts/{alert_id}?enabled=false",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["enabled"] is False
    response = client.patch(
        f"/alerts/{alert_id}?enabled=true",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["enabled"] is True

def test_delete_pass_alert(client, auth_headers):
    location_response = client.post(
        "/locations",
        json={
            "name": "Hyderabad",
            "latitude": 17.3850,
            "longitude": 78.4867
        },
        headers=auth_headers
    )
    location_id = location_response.json()["id"]
    create_response = client.post(
        "/alerts",
        json={
            "satellite_name": "ISS (ZARYA)",
            "location_id": location_id,
            "min_elevation": 30
        },
        headers=auth_headers
    )
    alert_id = create_response.json()["id"]
    response = client.delete(
        f"/alerts/{alert_id}",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Pass alert deleted successfully"
    response = client.get(
        "/alerts",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json() == []


def test_pass_alert_requires_authentication(client):
    response = client.get("/alerts")
    assert response.status_code in (401, 403)