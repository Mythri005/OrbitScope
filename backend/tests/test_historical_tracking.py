def test_record_current_position(db_session, historical_service):
    result = historical_service.record_current_position(
        db=db_session,
        satellite_name="ISS (ZARYA)"
    )
    assert result.satellite_name == "ISS (ZARYA)"
    assert result.timestamp is not None
    assert result.latitude == 10.0
    assert result.longitude == 20.0
    assert result.altitude == 400.0

def test_get_historical_tracking(db_session, historical_service):
    historical_service.record_current_position(
        db=db_session,
        satellite_name="ISS (ZARYA)"
    )
    records = historical_service.get_historical_tracking(
        db=db_session,
        satellite_name="ISS (ZARYA)"
    )
    assert len(records) == 1
    record = records[0]
    assert record.satellite_name == "ISS (ZARYA)"
    assert record.timestamp is not None
    assert record.latitude == 10.0
    assert record.longitude == 20.0
    assert record.altitude == 400.0

def test_get_historical_tracking_empty(db_session, historical_service):
    records = historical_service.get_historical_tracking(
        db=db_session,
        satellite_name="NON_EXISTENT_SATELLITE"
    )
    assert records == []