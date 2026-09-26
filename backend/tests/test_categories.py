def test_get_satellite_categories(client, auth_headers):
    response = client.get(
        "/satellites/categories",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "stations" in data
    assert "weather" in data
    assert "gps" in data
    assert "communication" in data
    assert "other" in data
    assert isinstance(data["stations"], list)
    assert isinstance(data["weather"], list)
    assert isinstance(data["gps"], list)
    assert isinstance(data["communication"], list)
    assert isinstance(data["other"], list)