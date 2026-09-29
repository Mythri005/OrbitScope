import requests
import os
from pathlib import Path
from skyfield.api import load, EarthSatellite
#load - loads the current time (and otehr skyfield resources). 
#EarthSatellite - Creates a satellite object from the two TLE lines

from skyfield.toposlib import wgs84
#wgs84 - converts the satellite's position into latitude, longitude and altitude

from skyfield import almanac

from config.settings import TLE_URL, CACHE_DURATION_HOURS
import logging
logger = logging.getLogger(__name__)

from datetime import datetime, timedelta, timezone
from models.satellite import *
import math

from exceptions.custom_exceptions import SatelliteNotFoundException, TLEDownloadException, PassPredictionUnavailableException

class SatelliteService:

    def __init__(self):
        self.ts = load.timescale()
        self.ephemeris = load("de421.bsp")
        self.tle_file = Path("tle_cache.txt")
        self.tle_data = None
        self.last_updated = None
        if self.tle_file.exists():
            self.tle_data = self.tle_file.read_text(encoding="utf-8")
            file_mtime = datetime.fromtimestamp(
                self.tle_file.stat().st_mtime,
                tz=timezone.utc
            )
            self.last_updated = file_mtime
            logger.info(
                f"Loaded TLE data from local cache. "
                f"Last updated: {self.last_updated}"
            )
    # def get_iss_data(self):
    #     url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle"
    #     response = requests.get(url)
    #     return response.text

    def refresh_tle_data(self):
        logger.info("Background TLE refresh started...")
        try:
            response = requests.get(
                TLE_URL,
                timeout=20,
                headers={
                    "User-Agent": "Mozilla/5.0"
                }
            )
            response.raise_for_status()
            tle_data = response.text
            # Basic validation
            if not tle_data.strip():
                raise ValueError("CelesTrak returned empty TLE data.")
            self.tle_data = tle_data
            self.last_updated = datetime.now(timezone.utc)
            self.tle_file.write_text(
                tle_data,
                encoding="utf-8"
            )
            logger.info(
                "Background TLE refresh completed successfully."
            )
        except (requests.exceptions.RequestException, ValueError) as e:
            logger.error(
                f"Background TLE refresh failed: {e}"
            )

    def download_tle(self):
        now = datetime.now(timezone.utc)
        if (
            self.tle_data is None
            or self.last_updated is None
            or now - self.last_updated > timedelta(hours=CACHE_DURATION_HOURS)
        ):
            try:
                logger.info("Downloading TLE data from CelesTrak...")
                response = requests.get(
                    TLE_URL,
                    timeout=20,
                    headers={
                        "User-Agent": "Mozilla/5.0"
                    }
                )
                response.raise_for_status()
                self.tle_data = response.text
                self.last_updated = now
                self.tle_file.write_text(
                    self.tle_data,
                    encoding="utf-8"
                )
            except requests.exceptions.RequestException as e:
                logger.error(f"Failed to download TLE data: {e}")
                if self.tle_data is None:
                    raise TLEDownloadException()
        return self.tle_data
    
    def load_satellite(self, satellite_name):
        tle_data = self.download_tle()

        lines = [
            line.strip()
            for line in tle_data.splitlines()
            if line.strip()
        ]

        for i in range(0, len(lines), 3):
            if i + 2 < len(lines):
                if satellite_name.lower() in lines[i].lower():
                    satellite = EarthSatellite(
                        lines[i + 1],
                        lines[i + 2],
                        lines[i],
                        self.ts
                    )
                    return satellite

        return None

    def get_current_position(self, satellite_name):
        satellite = self.load_satellite(satellite_name)
        if satellite is None:
            raise SatelliteNotFoundException(satellite_name)
        
        logger.info(f"Satellite loaded: {satellite.name}")

        t = self.ts.now()
        geocentric = satellite.at(t)  #Calculate where the ISS is in space at this exact moment.
        subpoint = wgs84.subpoint(geocentric)
        return {
            "name": satellite.name,
            "latitude": subpoint.latitude.degrees,
            "longitude": subpoint.longitude.degrees,
            "altitude": subpoint.elevation.km,
        }

    def get_multi_satellite_tracking(self, satellite_names: list[str]):
        satellites = []
        for satellite_name in satellite_names:
            position = self.get_current_position(satellite_name)
            satellites.append(position)
        return {
            "satellites": satellites
        }

    def get_all_satellites(self):
        tle_data = self.download_tle()

        lines = [
            line.strip()
            for line in tle_data.splitlines()
            if line.strip()
        ]

        satellites = []

        for i in range(0, len(lines), 3):
            if i + 2 < len(lines):
                satellites.append(lines[i])

        return satellites
    
    def search_satellites(self, search_name):
        tle_data = self.download_tle()

        lines = [
            line.strip()
            for line in tle_data.splitlines()
            if line.strip()
        ]

        satellites = []

        for i in range(0, len(lines), 3):
            if i + 2 < len(lines):
                if search_name.lower() in lines[i].lower():
                    satellites.append(lines[i])

        return satellites
    
    def get_orbit_prediction(self, satellite_name: str, duration: int, interval: int):
        satellite = self.load_satellite(satellite_name)
        if satellite is None:
            raise SatelliteNotFoundException(satellite_name)
        start_time = datetime.now(timezone.utc)
        positions = []
        for minutes in range(0, duration + 1, interval):
            future_datetime = start_time + timedelta(minutes=minutes)
            future_time = self.ts.from_datetime(future_datetime)
            geocentric = satellite.at(future_time)
            subpoint = wgs84.subpoint(geocentric)
            positions.append(
                OrbitPoint(
                    time=future_datetime,
                    latitude=subpoint.latitude.degrees,
                    longitude=subpoint.longitude.degrees,
                    altitude=subpoint.elevation.km,
                )
            )
        return OrbitResponse(
            name=satellite.name,
            positions=positions
        )

    def get_orbit_analytics(self, satellite_name: str, duration: int, interval: int):
        orbit = self.get_orbit_prediction(
            satellite_name,
            duration,
            interval
        )
        positions = orbit.positions
        if not positions:
            raise PassPredictionUnavailableException()
        altitudes = [point.altitude for point in positions]
        latitudes = [point.latitude for point in positions]
        longitudes = [point.longitude for point in positions]
        satellite = self.load_satellite(satellite_name)
        if satellite is None:
            raise SatelliteNotFoundException(satellite_name)
        model = satellite.model
        mean_motion = model.no_kozai * 1440 / (2 * math.pi)
        if mean_motion <= 0:
            raise PassPredictionUnavailableException()
        estimated_orbital_period = 1440 / mean_motion
        return OrbitAnalyticsResponse(
            name=orbit.name,
            duration_minutes=duration,
            point_count=len(positions),
            min_altitude=round(min(altitudes), 2),
            max_altitude=round(max(altitudes), 2),
            average_altitude=round(
                sum(altitudes) / len(altitudes),
                2
            ),
            min_latitude=round(min(latitudes), 2),
            max_latitude=round(max(latitudes), 2),
            min_longitude=round(min(longitudes), 2),
            max_longitude=round(max(longitudes), 2),
            estimated_orbital_period_minutes=round(
                estimated_orbital_period,
                2
            )
        )

    def get_ground_track(self, satellite_name: str, duration: int, interval: int):
        satellite = self.load_satellite(satellite_name)
        if satellite is None:
            raise SatelliteNotFoundException(satellite_name)
        start_time = datetime.now(timezone.utc)
        points = []
        for minutes in range(0, duration + 1, interval):
            future_datetime = start_time + timedelta(minutes=minutes)
            future_time = self.ts.from_datetime(future_datetime)
            geocentric = satellite.at(future_time)
            subpoint = wgs84.subpoint(geocentric)
            points.append(
                GroundTrackPoint(
                    time=future_datetime,
                    latitude=subpoint.latitude.degrees,
                    longitude=subpoint.longitude.degrees
                )
            )
        return GroundTrackResponse(
            name=satellite.name,
            points=points
        )
    
    def get_satellite_details(self, satellite_name: str):
        satellite = self.load_satellite(satellite_name)
        if satellite is None:
            raise SatelliteNotFoundException(satellite_name)
        model = satellite.model
        mean_motion = model.no_kozai * 1440 / (2 * math.pi)
        if mean_motion <= 0:
            logger.error(
                f"Invalid mean motion for satellite "
                f"{satellite.name}: {mean_motion}"
            )
            raise TLEDownloadException()
        orbital_period = 1440 / mean_motion
        return SatelliteDetailsResponse(
            name=satellite.name,
            norad_id=model.satnum,
            inclination=math.degrees(model.inclo),
            eccentricity=model.ecco,
            mean_motion=mean_motion,
            orbital_period=orbital_period,
            epoch=satellite.epoch.utc_datetime()
        )

    def is_satellite_sunlit(self, satellite, time):
        return satellite.at(time).is_sunlit(self.ephemeris)

    def is_observer_in_darkness(self, latitude, longitude, time):
        observer = self.ephemeris["earth"] + wgs84.latlon(
            latitude,
            longitude
        )
        sun_position = observer.at(time).observe(
            self.ephemeris["sun"]
        ).apparent()
        altitude, azimuth, distance = sun_position.altaz()
        return bool(altitude.degrees < 0)

    def calculate_actual_visibility(self, max_elevation, is_sunlit, is_observer_in_darkness):
        if not is_sunlit:
            return "Not Visible"
        if not is_observer_in_darkness:
            return "Daylight"
        if max_elevation < 10:
            return "Low"
        if max_elevation < 30:
            return "Moderate"
        return "High"

    def calculate_recommendation(self, visibility, quality, is_sunlit, is_observer_in_darkness):
        if not is_sunlit:
            return "Not Recommended"
        if not is_observer_in_darkness:
            return "Not Recommended"
        if visibility == "High" and quality in ["Good", "Excellent"]:
            return "Recommended"
        if visibility == "Moderate" and quality in ["Fair", "Good", "Excellent"]:
            return "Maybe"
        return "Not Recommended"

    def calculate_pass_score(self, satellite_pass):
        score = 0.0
        if satellite_pass.is_observer_in_darkness:
            score += 30
        if satellite_pass.is_sunlit:
            score += 25
        elevation_score = min(
            satellite_pass.max_elevation,
            90
        ) / 90 * 25
        score += elevation_score
        visibility_score = {
            "High": 10,
            "Moderate": 6,
            "Low": 2,
            "DayLight": 0,
            "Not Visible": 0
        }
        score += visibility_score.get (
            satellite_pass.visibility,
            0
        )
        quality_scores = {
            "Excellent": 10,
            "Good": 7,
            "Fair": 4,
            "Poor": 1
        }
        score += quality_scores.get (
            satellite_pass.quality,
            0
        )
        return round(score, 2)

    def _calculate_passes(
        self,
        satellite_name: str,
        latitude: float,
        longitude: float,
        start_time: datetime,
        end_time: datetime,
        min_elevation: float = 0.0
    ):
        satellite = self.load_satellite(satellite_name)
        if satellite is None:
            raise SatelliteNotFoundException(satellite_name)
        observer = wgs84.latlon(
            latitude,
            longitude
        )
        t0 = self.ts.from_datetime(start_time)
        t1 = self.ts.from_datetime(end_time)
        times, events = satellite.find_events(
            observer,
            t0,
            t1
        )
        passes = []
        rise_time = None
        culmination_time = None
        max_elevation = None
        is_sunlit = None
        is_observer_in_darkness = None
        for time, event in zip(times, events):
            if event == 0:
                rise_time = time.utc_datetime()
            elif event == 1 and rise_time is not None:
                culmination_time = time.utc_datetime()
                difference = satellite - observer
                topocentric = difference.at(time)
                altitude, azimuth, distance = topocentric.altaz()
                max_elevation = altitude.degrees
                is_sunlit = self.is_satellite_sunlit(
                    satellite,
                    time
                )
                is_observer_in_darkness = self.is_observer_in_darkness(
                    latitude,
                    longitude,
                    time
                )
            elif (
                event == 2
                and rise_time is not None
                and culmination_time is not None
            ):
                set_time = time.utc_datetime()
                duration_minutes = (
                    set_time - rise_time
                ).total_seconds() / 60
                visibility = self.calculate_actual_visibility(
                    max_elevation,
                    is_sunlit,
                    is_observer_in_darkness
                )
                if max_elevation < 10:
                    quality = "Poor"
                elif max_elevation < 30:
                    quality = "Fair"
                elif max_elevation < 60:
                    quality = "Good"
                else:
                    quality = "Excellent"
                recommendation = self.calculate_recommendation(
                    visibility,
                    quality,
                    is_sunlit,
                    is_observer_in_darkness
                )
                passes.append(
                    SatellitePass(
                        rise_time=rise_time,
                        culmination_time=culmination_time,
                        set_time=set_time,
                        max_elevation=max_elevation,
                        duration_minutes=duration_minutes,
                        visibility=visibility,
                        quality=quality,
                        is_sunlit=is_sunlit,
                        is_observer_in_darkness=is_observer_in_darkness,
                        recommendation=recommendation
                    )
                )
                rise_time = None
                culmination_time = None
                max_elevation = None
                is_sunlit = None
                is_observer_in_darkness = None
        if min_elevation > 0:
            passes = self.filter_passes_by_elevation(
                passes,
                min_elevation
            )
        return passes

    def get_pass_prediction(self, satellite_name: str, latitude: float, longitude: float, min_elevation = 0.0, hours = 24, sort_by = "time", limit = 10):
        satellite = self.load_satellite(satellite_name)
        if satellite is None:
            raise SatelliteNotFoundException(satellite_name)
        observer = wgs84.latlon(latitude, longitude)
        start_time = datetime.now(timezone.utc)
        end_time = start_time + timedelta(hours=hours)
        t0 = self.ts.from_datetime(start_time)
        t1 = self.ts.from_datetime(end_time)
        times, events = satellite.find_events(
            observer,
            t0,
            t1
        )
        passes = []
        rise_time = None
        culmination_time = None
        max_elevation = None
        is_sunlit = None
        is_observer_in_darkness = None
        for time, event in zip(times, events):
            if event == 0:
                rise_time = time.utc_datetime()
            elif event == 1 and rise_time is not None:
                culmination_time = time.utc_datetime()
                difference = satellite - observer
                topocentric = difference.at(time)
                altitude, azimuth, distance = topocentric.altaz()
                max_elevation = altitude.degrees
                is_sunlit = self.is_satellite_sunlit(satellite, time)
                is_observer_in_darkness = self.is_observer_in_darkness(
                    latitude,
                    longitude,
                    time
                )
            elif event == 2 and rise_time is not None and culmination_time is not None:
                set_time = time.utc_datetime()
                duration_minutes = (
                    set_time - rise_time
                ).total_seconds() / 60
                visibility = self.calculate_actual_visibility(
                    max_elevation,
                    is_sunlit,
                    is_observer_in_darkness
                )
                if max_elevation < 10:
                    quality = "Poor"
                elif max_elevation < 30:
                    quality = "Fair"
                elif max_elevation < 60:
                    quality = "Good"
                else:
                    quality = "Excellent"
                recommendation = self.calculate_recommendation(
                    visibility,
                    quality,
                    is_sunlit,
                    is_observer_in_darkness
                )
                passes.append(
                    SatellitePass(
                        rise_time=rise_time,
                        culmination_time=culmination_time,
                        set_time=set_time,
                        max_elevation=max_elevation,
                        duration_minutes=duration_minutes,
                        visibility=visibility,
                        quality=quality,
                        is_sunlit=is_sunlit,
                        is_observer_in_darkness=is_observer_in_darkness,
                        recommendation=recommendation
                    )
                )
                rise_time = None
                culmination_time = None
                max_elevation = None
                is_sunlit = None
                is_observer_in_darkness = None
        if min_elevation > 0:
            passes = self.filter_passes_by_elevation(
                passes,
                min_elevation
            )
        if not passes:
            return PassPredictionResponse(
                name=satellite.name,
                passes=[],
                best_pass_index=-1,
                best_pass=None
            )
        if sort_by == "elevation":
            passes.sort(
                key=lambda satellite_pass: satellite_pass.max_elevation,
                reverse=True
            )
        elif sort_by == "time":
            passes.sort(
                key=lambda satellite_pass: satellite_pass.rise_time
            )
        else:
            raise ValueError(
                "sort_by must be 'time' or 'elevation'"
            )
        passes = passes[:limit]
        best_pass_index = max(
            range(len(passes)),
            key=lambda i: passes[i].max_elevation
        )
        best_pass = passes[best_pass_index]
        return PassPredictionResponse(
            name=satellite.name,
            passes=passes,
            best_pass_index=best_pass_index,
            best_pass=best_pass
        )

    def get_pass_calendar(self, satellite_name: str, latitude: float, longitude: float, days: int = 7, min_elevation: float = 0.0):
        start_time = datetime.now(timezone.utc)
        end_time = start_time + timedelta(days=days)
        passes = self._calculate_passes(
            satellite_name=satellite_name,
            latitude=latitude,
            longitude=longitude,
            start_time=start_time,
            end_time=end_time,
            min_elevation=min_elevation
        )
        return {
            "name": satellite_name,
            "days": days,
            "passes": passes
        }

    def get_best_satellite(self, satellite_names: list[str], latitude: float, longitude: float, hours: int = 24, min_elevation: float = 0.0):
        best_satellite = None
        best_pass = None
        best_score = -1.0
        start_time = datetime.now(timezone.utc)
        end_time = start_time + timedelta(hours=hours)
        for satellite_name in satellite_names:
            try:
                passes = self._calculate_passes(
                    satellite_name=satellite_name,
                    latitude=latitude,
                    longitude=longitude,
                    start_time=start_time,
                    end_time=end_time,
                    min_elevation=min_elevation
                )
                for satellite_pass in passes:
                    score = self.calculate_pass_score(satellite_pass)
                    if score > best_score:
                        best_score = score
                        best_satellite = satellite_name
                        best_pass = satellite_pass
            except SatelliteNotFoundException:
                continue
        if best_satellite is None or best_pass is None:
            raise PassPredictionUnavailableException()
        reason = (
            f"{best_satellite} has the best viewing opportunity "
            f"with a score of {best_score}."
        )
        return BestSatelliteResponse(
            satellite_name=best_satellite,
            pass_details=best_pass,
            score=best_score,
            reason=reason
        )

    def filter_passes_by_elevation(self, passes, min_elevation):
        return [
            satellite_pass
            for satellite_pass in passes
            if satellite_pass.max_elevation >= min_elevation
        ]

    def get_satellite_categories(self):
        satellites = self.get_all_satellites()
        categories = {
            "stations": [],
            "weather": [],
            "gps": [],
            "communication": [],
            "other": []
        }
        for satellite in satellites:
            name = satellite.lower()
            if any(keyword in name for keyword in [
                "iss", "space station", "tiangong"
            ]):
                categories["stations"].append(satellite)
            elif any(keyword in name for keyword in [
                "noaa", "goes", "meteosat", "weather"
            ]):
                categories["weather"].append(satellite)
            elif any(keyword in name for keyword in [
                "gps", "navstar", "glonass", "galileo", "beidou"
            ]):
                categories["gps"].append(satellite)
            elif any(keyword in name for keyword in [
                "iridium", "starlink", "oneweb", "intelsat",
                "inmarsat", "globalstar"
            ]):
                categories["communication"].append(satellite)
            else:
                categories["other"].append(satellite)
        return categories

    def compare_satellites(self, satellite_names: list[str]):
        if not satellite_names:
            raise SatelliteNotFoundException("No satellites provided")
        comparisons = []
        for satellite_name in satellite_names:
            satellite = self.load_satellite(satellite_name)
            if satellite is None:
                raise SatelliteNotFoundException(satellite_name)
            model = satellite.model
            mean_motion = model.no_kozai * 1440 / (2 * math.pi)
            if mean_motion <= 0:
                raise PassPredictionUnavailableException()
            orbital_period = 1440 / mean_motion
            comparisons.append(
                SatelliteComparisonItem(
                    name=satellite.name,
                    norad_id=model.satnum,
                    inclination=math.degrees(model.inclo),
                    eccentricity=model.ecco,
                    mean_motion=mean_motion,
                    orbital_period=orbital_period,
                    epoch=satellite.epoch.utc_datetime()
                )
            )
        return SatelliteComparisonResponse(
            satellites=comparisons
        )