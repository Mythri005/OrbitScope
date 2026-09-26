def test_create_location(client, auth_headers):
    response = client.post(
        "/locations",
        json={
            "name": "Hyderabad",
            "latitude": 17.3850,
            "longitude": 78.4867
        },
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Hyderabad"
    assert data["latitude"] == 17.3850
    assert data["longitude"] == 78.4867
    assert "id" in data

def test_get_locations(client, auth_headers):
    client.post(
        "/locations",
        json={
            "name": "Hyderabad",
            "latitude": 17.3850,
            "longitude": 78.4867
        },
        headers=auth_headers
    )
    client.post(
        "/locations",
        json={
            "name": "Bangalore",
            "latitude": 12.9716,
            "longitude": 77.5946
        },
        headers=auth_headers
    )
    response = client.get(
        "/locations",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["name"] == "Hyderabad"
    assert data[1]["name"] == "Bangalore"

def test_get_single_location(client, auth_headers):
    create_response = client.post(
        "/locations",
        json={
            "name": "Hyderabad",
            "latitude": 17.3850,
            "longitude": 78.4867
        },
        headers=auth_headers
    )
    location_id = create_response.json()["id"]
    response = client.get(
        f"/locations/{location_id}",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == location_id
    assert data["name"] == "Hyderabad"

def test_delete_location(client, auth_headers):
    create_response = client.post(
        "/locations",
        json={
            "name": "Hyderabad",
            "latitude": 17.3850,
            "longitude": 78.4867
        },
        headers=auth_headers
    )
    location_id = create_response.json()["id"]
    response = client.delete(
        f"/locations/{location_id}",
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["message"] == (
        "Observer location deleted successfully"
    )
    get_response = client.get(
        f"/locations/{location_id}",
        headers=auth_headers
    )
    assert get_response.status_code == 404

def test_invalid_latitude(client, auth_headers):
    response = client.post(
        "/locations",
        json={
            "name": "Invalid Location",
            "latitude": 100.0,
            "longitude": 78.4867
        },
        headers=auth_headers
    )
    assert response.status_code == 422

def test_invalid_longitude(client, auth_headers):
    response = client.post(
        "/locations",
        json={
            "name": "Invalid Location",
            "latitude": 17.3850,
            "longitude": 200.0
        },
        headers=auth_headers
    )
    assert response.status_code == 422

def test_locations_require_authentication(client):
    response = client.get("/locations")
    assert response.status_code == 401

def test_user_cannot_access_another_users_location(client):
    user_a_email = "usera@example.com"
    user_a_password = "Password123"
    client.post(
        "/register",
        json={
            "email": user_a_email,
            "password": user_a_password
        }
    )
    login_a = client.post(
        "/login",
        data={
            "username": user_a_email,
            "password": user_a_password
        }
    )
    headers_a = {
        "Authorization": f"Bearer {login_a.json()['access_token']}"
    }
    create_response = client.post(
        "/locations",
        json={
            "name": "Hyderabad",
            "latitude": 17.3850,
            "longitude": 78.4867
        },
        headers=headers_a
    )
    location_id = create_response.json()["id"]
    user_b_email = "userb@example.com"
    user_b_password = "Password123"
    client.post(
        "/register",
        json={
            "email": user_b_email,
            "password": user_b_password
        }
    )
    login_b = client.post(
        "/login",
        data={
            "username": user_b_email,
            "password": user_b_password
        }
    )
    headers_b = {
        "Authorization": f"Bearer {login_b.json()['access_token']}"
    }
    response = client.get(
        f"/locations/{location_id}",
        headers=headers_b
    )
    assert response.status_code == 404

def test_get_night_planner(client):
    client.post(
        "/register",
        json={
            "email": "nightplanner@example.com",
            "password": "Password123"
        }
    )
    login_response = client.post(
        "/login",
        data={
            "username": "nightplanner@example.com",
            "password": "Password123"
        }
    )
    token = login_response.json()["access_token"]
    headers = {
        "Authorization": f"Bearer {token}"
    }
    create_response = client.post(
        "/locations",
        json={
            "name": "Hyderabad",
            "latitude": 17.3850,
            "longitude": 78.4867
        },
        headers=headers
    )
    assert create_response.status_code == 200
    location_id = create_response.json()["id"]
    response = client.get(
        f"/locations/{location_id}/night?date=2026-08-25",
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["location_id"] == location_id
    assert data["location_name"] == "Hyderabad"
    assert data["date"] == "2026-08-25"
    assert data["sunset"] is not None
    assert data["civil_twilight_end"] is not None
    assert data["nautical_twilight_end"] is not None
    assert data["astronomical_twilight_end"] is not None
    assert data["astronomical_twilight_begin"] is not None
    assert data["nautical_twilight_begin"] is not None
    assert data["civil_twilight_begin"] is not None
    assert data["sunrise"] is not None
    assert data["darkness_duration_minutes"] > 0
    assert isinstance(
        data["is_dark_now"],
        bool
    )

def test_get_night_planner_default_date(client):
    client.post(
        "/register",
        json={
            "email": "nightdefault@example.com",
            "password": "Password123"
        }
    )
    login_response = client.post(
        "/login",
        data={
            "username": "nightdefault@example.com",
            "password": "Password123"
        }
    )
    token = login_response.json()["access_token"]
    headers = {
        "Authorization": f"Bearer {token}"
    }
    create_response = client.post(
        "/locations",
        json={
            "name": "Hyderabad",
            "latitude": 17.3850,
            "longitude": 78.4867
        },
        headers=headers
    )
    location_id = create_response.json()["id"]
    response = client.get(
        f"/locations/{location_id}/night",
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["location_id"] == location_id
    assert data["location_name"] == "Hyderabad"
    assert data["sunset"] is not None
    assert data["sunrise"] is not None

def test_get_night_planner_invalid_date(client):
    client.post(
        "/register",
        json={
            "email": "nightinvalid@example.com",
            "password": "Password123"
        }
    )
    login_response = client.post(
        "/login",
        data={
            "username": "nightinvalid@example.com",
            "password": "Password123"
        }
    )
    token = login_response.json()["access_token"]
    headers = {
        "Authorization": f"Bearer {token}"
    }
    create_response = client.post(
        "/locations",
        json={
            "name": "Hyderabad",
            "latitude": 17.3850,
            "longitude": 78.4867
        },
        headers=headers
    )
    location_id = create_response.json()["id"]
    response = client.get(
        f"/locations/{location_id}/night?date=not-a-date",
        headers=headers
    )
    assert response.status_code == 422

def test_user_cannot_access_another_users_night_planner(client):
    user_a_email = "nightusera@example.com"
    user_a_password = "Password123"
    client.post(
        "/register",
        json={
            "email": user_a_email,
            "password": user_a_password
        }
    )
    login_a = client.post(
        "/login",
        data={
            "username": user_a_email,
            "password": user_a_password
        }
    )
    headers_a = {
        "Authorization": f"Bearer {login_a.json()['access_token']}"
    }
    create_response = client.post(
        "/locations",
        json={
            "name": "Hyderabad",
            "latitude": 17.3850,
            "longitude": 78.4867
        },
        headers=headers_a
    )
    assert create_response.status_code == 200
    location_id = create_response.json()["id"]
    user_b_email = "nightuserb@example.com"
    user_b_password = "Password123"
    client.post(
        "/register",
        json={
            "email": user_b_email,
            "password": user_b_password
        }
    )
    login_b = client.post(
        "/login",
        data={
            "username": user_b_email,
            "password": user_b_password
        }
    )
    headers_b = {
        "Authorization": f"Bearer {login_b.json()['access_token']}"
    }
    response = client.get(
        f"/locations/{location_id}/night?date=2026-08-25",
        headers=headers_b
    )
    assert response.status_code == 404