def get_auth_token(client):
    client.post(
        "/register",
        json={
            "email": "favoriteuser@example.com",
            "password": "TestPassword123"
        }
    )
    response = client.post(
        "/login",
        data={
            "username": "favoriteuser@example.com",
            "password": "TestPassword123"
        }
    )
    return response.json()["access_token"]

def test_add_favorite(client):
    token = get_auth_token(client)

    response = client.post(
        "/favorites/ISS",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["satellite_name"] == "ISS"

def test_get_favorites(client):
    token = get_auth_token(client)
    client.post(
        "/favorites/ISS",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )
    response = client.get(
        "/favorites",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["satellite_name"] == "ISS"

def test_duplicate_favorite(client):
    token = get_auth_token(client)
    headers = {
        "Authorization": f"Bearer {token}"
    }
    first_response = client.post(
        "/favorites/ISS",
        headers=headers
    )
    assert first_response.status_code == 200
    second_response = client.post(
        "/favorites/ISS",
        headers=headers
    )
    assert second_response.status_code == 409

def test_delete_favorite(client):
    token = get_auth_token(client)
    headers = {
        "Authorization": f"Bearer {token}"
    }
    client.post(
        "/favorites/ISS",
        headers=headers
    )
    response = client.delete(
        "/favorites/ISS",
        headers=headers
    )
    assert response.status_code == 200

def test_delete_missing_favorite(client):
    token = get_auth_token(client)
    response = client.delete(
        "/favorites/MOON",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )
    assert response.status_code == 404