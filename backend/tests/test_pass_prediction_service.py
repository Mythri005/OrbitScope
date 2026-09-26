from datetime import datetime, timezone, timedelta
from services.satellite_service import SatelliteService

class FakeSatellite:
    name = "ISS"
    def at(self, time):
        return FakeSatellitePosition()
    def find_events(self, observer, t0, t1):
        times = [
            FakeTime("2026-08-15T10:00:00+00:00"),
            FakeTime("2026-08-15T10:05:00+00:00"),
            FakeTime("2026-08-15T10:10:00+00:00"),
            FakeTime("2026-08-15T15:00:00+00:00"),
            FakeTime("2026-08-15T15:05:00+00:00"),
            FakeTime("2026-08-15T15:10:00+00:00"),
        ]
        events = [0, 1, 2, 0, 1, 2]
        return times, events

    def __sub__(self, other):
        return FakeDifference()

class FakeSatellitePosition:
    def is_sunlit(self, ephemeris):
        return True
        
class FakeTime:
    def __init__(self, value):
        self.value = datetime.fromisoformat(value)

    def utc_datetime(self):
        return self.value

class FakeDifference:
    def at(self, time):
        return self

    def altaz(self):
        return FakeAltitude(), None, None

class FakeAltitude:
    @property
    def degrees(self):
        return 45.0

def test_multiple_passes():
    service = SatelliteService()
    service.load_satellite = lambda satellite_name: FakeSatellite()
    service.is_observer_in_darkness = (
        lambda latitude, longitude, time: True
    )
    result = service.get_pass_prediction(
        "ISS",
        10.0,
        20.0
    )
    assert result.name == "ISS"
    assert len(result.passes) == 2
    assert result.passes[0].max_elevation == 45.0
    assert result.passes[0].duration_minutes == 10.0
    assert result.passes[0].visibility == "High"
    assert result.passes[0].quality == "Good"
    assert result.passes[1].max_elevation == 45.0
    assert result.passes[1].duration_minutes == 10.0
    assert result.passes[1].visibility == "High"
    assert result.passes[1].quality == "Good"
    assert result.passes[0].is_sunlit is True
    assert result.passes[1].is_sunlit is True

def test_is_satellite_sunlit():
    service = SatelliteService()
    satellite = FakeSatellite()
    fake_time = service.ts.from_datetime(
        datetime(2026, 8, 15, 10, 5, tzinfo=timezone.utc)
    )
    result = service.is_satellite_sunlit(
        satellite,
        fake_time
    )
    assert isinstance(result, bool)

def test_observer_in_darkness():
    service = SatelliteService()
    fake_time = service.ts.from_datetime(
        datetime(2026, 8, 15, 10, 5, tzinfo=timezone.utc)
    )
    result = service.is_observer_in_darkness(
        10.0,
        20.0,
        fake_time
    )
    assert isinstance(result, bool)

def test_calculate_actual_visibility():
    service = SatelliteService()
    assert service.calculate_actual_visibility(
        45.0,
        True,
        True
    ) == "High"
    assert service.calculate_actual_visibility(
        20.0,
        True,
        True
    ) == "Moderate"
    assert service.calculate_actual_visibility(
        5.0,
        True,
        True
    ) == "Low"
    assert service.calculate_actual_visibility(
        45.0,
        False,
        True
    ) == "Not Visible"
    assert service.calculate_actual_visibility(
        45.0,
        True,
        False
    ) == "Daylight"

def test_calculate_recommendation():
    service = SatelliteService()

    assert service.calculate_recommendation(
        "High",
        "Excellent",
        True,
        True
    ) == "Recommended"

    assert service.calculate_recommendation(
        "High",
        "Good",
        True,
        True
    ) == "Recommended"

    assert service.calculate_recommendation(
        "Daylight",
        "Excellent",
        True,
        False
    ) == "Not Recommended"

    assert service.calculate_recommendation(
        "Not Visible",
        "Excellent",
        False,
        True
    ) == "Not Recommended"

def test_recommendation_satellite_not_sunlit():
    service = SatelliteService()
    result = service.calculate_recommendation(
        "High",
        "Good",
        False,
        True
    )
    assert result == "Not Recommended"

def test_recommendation_observer_in_daylight():
    service = SatelliteService()
    result = service.calculate_recommendation(
        "High",
        "Good",
        True,
        False
    )
    assert result == "Not Recommended"

def test_best_pass_prefers_visible_pass():
    service = SatelliteService()

    class FakePass:
        def __init__(self, elevation, visibility, recommendation):
            self.max_elevation = elevation
            self.visibility = visibility
            self.recommendation = recommendation
    passes = [
        FakePass(80.0, "Daylight", "Not Recommended"),
        FakePass(45.0, "High", "Recommended"),
    ]
    best_pass_index = max(
        range(len(passes)),
        key=lambda i: (
            passes[i].recommendation == "Recommended",
            passes[i].visibility == "High",
            passes[i].max_elevation
        )
    )
    assert best_pass_index == 1

def test_filter_passes_by_minimum_elevation():
    service = SatelliteService()
    class FakePass:
        def __init__(self, elevation):
            self.max_elevation = elevation
    passes = [
        FakePass(15.0),
        FakePass(45.0),
        FakePass(25.0),
    ]
    filtered_passes = [
        satellite_pass
        for satellite_pass in passes
        if satellite_pass.max_elevation >= 30.0
    ]
    assert len(filtered_passes) == 1
    assert filtered_passes[0].max_elevation == 45.0

def test_filter_passes_by_elevation():
    service = SatelliteService()
    class FakePass:
        def __init__(self, elevation):
            self.max_elevation = elevation
    passes = [
        FakePass(5.0),
        FakePass(20.0),
        FakePass(45.0),
        FakePass(70.0)
    ]
    result = service.filter_passes_by_elevation(
        passes,
        30.0
    )
    assert len(result) == 2
    assert result[0].max_elevation == 45.0
    assert result[1].max_elevation == 70.0

def test_prediction_window_hours():
    service = SatelliteService()
    start_time = datetime.now(timezone.utc)
    end_time = start_time + timedelta(hours=6)
    assert (end_time - start_time).total_seconds() == 6 * 60 * 60

def test_sort_passes_by_elevation():
    service = SatelliteService()
    class FakePass:
        def __init__(self, elevation, rise_time):
            self.max_elevation = elevation
            self.rise_time = rise_time
    passes = [
        FakePass(30.0, datetime(2026, 8, 15, 10, 0, tzinfo=timezone.utc)),
        FakePass(60.0, datetime(2026, 8, 15, 12, 0, tzinfo=timezone.utc)),
        FakePass(45.0, datetime(2026, 8, 15, 11, 0, tzinfo=timezone.utc)),
    ]
    passes.sort(
        key=lambda satellite_pass: satellite_pass.max_elevation,
        reverse=True
    )
    assert passes[0].max_elevation == 60.0
    assert passes[1].max_elevation == 45.0
    assert passes[2].max_elevation == 30.0