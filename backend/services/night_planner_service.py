from datetime import datetime, timedelta, timezone

from skyfield import almanac
from skyfield.api import load
from skyfield.toposlib import wgs84

from models.night_planner import NightPlannerResponse


class NightPlannerService:

    def __init__(self):
        self.ts = load.timescale()
        self.ephemeris = load("de421.bsp")

    def get_night_planner(
        self,
        location_id: int,
        location_name: str,
        latitude: float,
        longitude: float,
        date: str
    ):
        # ---------------------------------------------------------
        # 1. Parse requested date
        # ---------------------------------------------------------
        year, month, day = map(int, date.split("-"))

        requested_date = datetime(
            year,
            month,
            day,
            tzinfo=timezone.utc
        )

        # ---------------------------------------------------------
        # 2. Create observer
        # ---------------------------------------------------------
        observer = wgs84.latlon(
            latitude,
            longitude
        )

        # ---------------------------------------------------------
        # 3. Search window
        #
        # We search around the requested date so that we have
        # enough events before and after the requested night.
        # ---------------------------------------------------------
        start_datetime = requested_date - timedelta(days=2)
        end_datetime = requested_date + timedelta(days=3)

        t0 = self.ts.from_datetime(start_datetime)
        t1 = self.ts.from_datetime(end_datetime)

        # ---------------------------------------------------------
        # 4. Calculate sunrise / sunset separately
        # ---------------------------------------------------------
        sunrise_sunset_function = almanac.sunrise_sunset(
            self.ephemeris,
            observer
        )

        rise_set_times, rise_set_events = almanac.find_discrete(
            t0,
            t1,
            sunrise_sunset_function
        )

        sunrise_events = []
        sunset_events = []

        previous_state = int(
            sunrise_sunset_function(t0)
        )

        for time, event in zip(
            rise_set_times,
            rise_set_events
        ):
            current_state = int(event)

            event_datetime = time.utc_datetime()

            # 0 = below horizon
            # 1 = above horizon
            if previous_state == 0 and current_state == 1:
                sunrise_events.append(event_datetime)

            elif previous_state == 1 and current_state == 0:
                sunset_events.append(event_datetime)

            previous_state = current_state

        # ---------------------------------------------------------
        # 5. Find sunset for requested UTC date
        # ---------------------------------------------------------
        sunset = next(
            (
                event
                for event in sunset_events
                if event.date() == requested_date.date()
            ),
            None
        )

        if sunset is None:
            raise ValueError(
                f"Could not find sunset for {date}."
            )

        # ---------------------------------------------------------
        # 6. Find sunrise after that sunset
        # ---------------------------------------------------------
        sunrise = next(
            (
                event
                for event in sunrise_events
                if event > sunset
            ),
            None
        )

        if sunrise is None:
            raise ValueError(
                f"Could not find sunrise after sunset for {date}."
            )

        # ---------------------------------------------------------
        # 7. Calculate twilight transitions
        # ---------------------------------------------------------
        twilight_function = almanac.dark_twilight_day(
            self.ephemeris,
            observer
        )

        times, events = almanac.find_discrete(
            t0,
            t1,
            twilight_function
        )

        transitions = []

        previous_state = int(
            twilight_function(t0)
        )

        for time, event in zip(times, events):

            current_state = int(event)

            transitions.append(
                {
                    "time": time.utc_datetime(),
                    "from": previous_state,
                    "to": current_state
                }
            )

            previous_state = current_state

        # ---------------------------------------------------------
        # 8. Find twilight events surrounding this sunset
        # ---------------------------------------------------------
        night = {
            "sunset": sunset,
            "sunrise": sunrise
        }

        # Only consider twilight events between sunset and sunrise
        night_transitions = [
            transition
            for transition in transitions
            if sunset <= transition["time"] <= sunrise
        ]

        for transition in night_transitions:

            from_state = transition["from"]
            to_state = transition["to"]
            event_time = transition["time"]

            # Civil twilight ends
            if (
                "civil_twilight_end" not in night
                and from_state == 3
                and to_state == 2
            ):
                night["civil_twilight_end"] = event_time

            # Nautical twilight ends
            elif (
                "nautical_twilight_end" not in night
                and from_state == 2
                and to_state == 1
            ):
                night["nautical_twilight_end"] = event_time

            # Astronomical twilight ends
            elif (
                "astronomical_twilight_end" not in night
                and from_state == 1
                and to_state == 0
            ):
                night["astronomical_twilight_end"] = event_time

            # Astronomical twilight begins
            elif (
                "astronomical_twilight_begin" not in night
                and from_state == 0
                and to_state == 1
            ):
                night["astronomical_twilight_begin"] = event_time

            # Nautical twilight begins
            elif (
                "nautical_twilight_begin" not in night
                and from_state == 1
                and to_state == 2
            ):
                night["nautical_twilight_begin"] = event_time

            # Civil twilight begins
            elif (
                "civil_twilight_begin" not in night
                and from_state == 2
                and to_state == 3
            ):
                night["civil_twilight_begin"] = event_time

        # ---------------------------------------------------------
        # 9. Validate twilight events
        # ---------------------------------------------------------
        required_fields = [
            "sunset",
            "civil_twilight_end",
            "nautical_twilight_end",
            "astronomical_twilight_end",
            "astronomical_twilight_begin",
            "nautical_twilight_begin",
            "civil_twilight_begin",
            "sunrise"
        ]

        missing_fields = [
            field
            for field in required_fields
            if field not in night
        ]

        if missing_fields:
            raise ValueError(
                f"Could not determine a complete night for {date}. "
                f"Missing: {', '.join(missing_fields)}"
            )

        # ---------------------------------------------------------
        # 10. Darkness duration
        # ---------------------------------------------------------
        darkness_duration_minutes = (
            night["astronomical_twilight_begin"]
            - night["astronomical_twilight_end"]
        ).total_seconds() / 60

        # ---------------------------------------------------------
        # 11. Determine current astronomical darkness
        # ---------------------------------------------------------
        current_time = self.ts.now()

        current_state = int(
            twilight_function(current_time)
        )

        is_dark_now = current_state == 0

        # ---------------------------------------------------------
        # 12. Return response
        # ---------------------------------------------------------
        return NightPlannerResponse(
            location_id=location_id,
            location_name=location_name,
            date=date,

            sunset=night["sunset"],

            civil_twilight_end=(
                night["civil_twilight_end"]
            ),

            nautical_twilight_end=(
                night["nautical_twilight_end"]
            ),

            astronomical_twilight_end=(
                night["astronomical_twilight_end"]
            ),

            astronomical_twilight_begin=(
                night["astronomical_twilight_begin"]
            ),

            nautical_twilight_begin=(
                night["nautical_twilight_begin"]
            ),

            civil_twilight_begin=(
                night["civil_twilight_begin"]
            ),

            sunrise=night["sunrise"],

            darkness_duration_minutes=(
                darkness_duration_minutes
            ),

            is_dark_now=is_dark_now
        )