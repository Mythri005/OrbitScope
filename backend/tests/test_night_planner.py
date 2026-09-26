from services.night_planner_service import NightPlannerService

def test_night_planner_returns_twilight_events():
    service = NightPlannerService()
    result = service.get_night_planner(
        location_id=1,
        location_name="Hyderabad",
        latitude=17.3850,
        longitude=78.4867,
        date="2026-08-25"
    )
    assert result.location_id == 1
    assert result.location_name == "Hyderabad"
    assert result.date == "2026-08-25"
    assert result.sunset is not None
    assert result.civil_twilight_end is not None
    assert result.nautical_twilight_end is not None
    assert result.astronomical_twilight_end is not None
    assert result.astronomical_twilight_begin is not None
    assert result.nautical_twilight_begin is not None
    assert result.civil_twilight_begin is not None
    assert result.sunrise is not None
    assert result.sunset < result.civil_twilight_end
    assert result.civil_twilight_end < result.nautical_twilight_end
    assert result.nautical_twilight_end < result.astronomical_twilight_end
    assert (
        result.astronomical_twilight_end
        < result.astronomical_twilight_begin
    )
    assert (
        result.astronomical_twilight_begin
        < result.nautical_twilight_begin
    )
    assert (
        result.nautical_twilight_begin
        < result.civil_twilight_begin
    )
    assert result.civil_twilight_begin < result.sunrise
    assert result.darkness_duration_minutes > 0

def test_night_planner_reports_boolean_darkness_state():
    service = NightPlannerService()
    result = service.get_night_planner(
        location_id=1,
        location_name="Hyderabad",
        latitude=17.3850,
        longitude=78.4867,
        date="2026-08-25"
    )
    assert isinstance(result.is_dark_now, bool)