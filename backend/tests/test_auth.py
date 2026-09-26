def test_register(client):
    response = client.post(
        "/register",
        json={
            "email": "testuser@example.com",
            "password": "TestPassword123"
        }
    )
    assert response.status_code == 200
    assert response.json()["message"] == "User registered successfully"

def test_login(client):
    # Register the user first
    register_response = client.post(
        "/register",
        json={
            "email": "loginuser@example.com",
            "password": "TestPassword123"
        }
    )
    assert register_response.status_code == 200
    # Login
    response = client.post(
        "/login",
        data={
            "username": "loginuser@example.com",
            "password": "TestPassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_wrong_password(client):
    client.post(
        "/register",
        json={
            "email": "wrongpassword@example.com",
            "password": "CorrectPassword123"
        }
    )

    response = client.post(
        "/login",
        data={
            "username": "wrongpassword@example.com",
            "password": "WrongPassword123"
        }
    )

    assert response.status_code == 401

def test_duplicate_registration(client):
    user = {
        "email": "duplicate@example.com",
        "password": "TestPassword123"
    }

    first_response = client.post(
        "/register",
        json=user
    )

    assert first_response.status_code == 200

    second_response = client.post(
        "/register",
        json=user
    )

    assert second_response.status_code == 409

def test_protected_endpoint_without_token(client):
    response = client.get("/satellite/ISS")

    assert response.status_code == 401


def test_protected_endpoint_with_invalid_token(client):
    response = client.get(
        "/satellite/ISS",
        headers={
            "Authorization": "Bearer invalid-token"
        }
    )

    assert response.status_code == 401