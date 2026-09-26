import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  MapPin,
  Moon,
  Satellite,
  Sun,
  Target,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import {
  getPassCalendar,
  type PassCalendarResponse,
  type SatellitePass,
} from "../services/passService";

import { useObserverLocation } from "../context/ObserverLocationContext";

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function getDateKey(value: string) {
  const date = new Date(value);

  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function groupPassesByDate(passes: SatellitePass[]) {
  const groups: Record<string, SatellitePass[]> = {};

  passes.forEach((pass) => {
    const key = getDateKey(pass.rise_time);

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(pass);
  });

  return groups;
}

function getBestPass(passes: SatellitePass[]) {
  if (!passes.length) {
    return null;
  }

  return passes.reduce((best, current) =>
    current.max_elevation > best.max_elevation
      ? current
      : best
  );
}

function CalendarPassCard({
  pass,
  best,
}: {
  pass: SatellitePass;
  best: boolean;
}) {
  return (
    <div
      className={`calendar-pass-card ${
        best ? "calendar-pass-best" : ""
      }`}
    >
      <div className="calendar-pass-time">
        <span>RISE</span>
        <strong>{formatTime(pass.rise_time)}</strong>
      </div>

      <div className="calendar-pass-peak">
        <Target size={17} />

        <div>
          <span>MAX ELEVATION</span>
          <strong>{pass.max_elevation.toFixed(1)}°</strong>
        </div>
      </div>

      <div className="calendar-pass-info">
        <div>
          <span>PEAK</span>
          <strong>{formatTime(pass.culmination_time)}</strong>
        </div>

        <div>
          <span>SET</span>
          <strong>{formatTime(pass.set_time)}</strong>
        </div>

        <div>
          <span>DURATION</span>
          <strong>{pass.duration_minutes.toFixed(1)} min</strong>
        </div>

        <div>
          <span>QUALITY</span>
          <strong>{pass.quality}</strong>
        </div>
      </div>

      <div className="calendar-pass-status">
        <div>
          <Eye size={15} />
          <span>{pass.visibility}</span>
        </div>

        <div>
          {pass.is_sunlit ? (
            <Sun size={15} />
          ) : (
            <Moon size={15} />
          )}

          <span>
            {pass.is_sunlit ? "Sunlit" : "Shadow"}
          </span>
        </div>

        {best && (
          <strong className="calendar-best-badge">
            BEST
          </strong>
        )}
      </div>
    </div>
  );
}

export default function PassCalendar() {
  const { satelliteName } = useParams();

  const decodedName = satelliteName
    ? decodeURIComponent(satelliteName)
    : "";

  const { activeLocation } = useObserverLocation();

  const [latitude, setLatitude] = useState(
    activeLocation ? String(activeLocation.latitude) : "17.3850"
  );

  const [longitude, setLongitude] = useState(
    activeLocation ? String(activeLocation.longitude) : "78.4867"
  );
  const [days, setDays] = useState("7");
  const [minElevation, setMinElevation] = useState("10");

  const [data, setData] =
    useState<PassCalendarResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activeLocation) return;

    setLatitude(String(activeLocation.latitude));
    setLongitude(String(activeLocation.longitude));
  }, [activeLocation]);

  async function loadCalendar(
    selectedLatitude = latitude,
    selectedLongitude = longitude
  ) {
    if (!decodedName) return;

    setLoading(true);
    setError("");

    try {
      const result = await getPassCalendar(
        decodedName,
        {
          lat: Number(selectedLatitude),
          lon: Number(selectedLongitude),
          days: Number(days),
          min_elevation: Number(minElevation),
        }
      );

      setData(result);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to load satellite pass calendar."
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!decodedName) return;

    if (activeLocation) {
      loadCalendar(
        String(activeLocation.latitude),
        String(activeLocation.longitude)
      );
    } else {
      loadCalendar();
    }
  }, [decodedName, activeLocation?.id]);

  const groupedPasses = useMemo(() => {
    if (!data) return {};

    return groupPassesByDate(data.passes);
  }, [data]);

  return (
    <main className="pass-calendar-page">

      <header className="calendar-header">

        <div>
          <Link
            to={`/satellites/${encodeURIComponent(
              decodedName
            )}/passes`}
            className="back-link"
          >
            <ArrowLeft size={17} />
            Back to pass prediction
          </Link>

          <div className="calendar-title">
            <CalendarDays size={25} />

            <div>
              <span>OBSERVATION SCHEDULE</span>
              <h1>{decodedName}</h1>
            </div>
          </div>
        </div>

        <div className="calendar-summary">
          <Satellite size={17} />
          <span>
            {data?.passes.length ?? 0} passes
          </span>
        </div>

      </header>

      <section className="calendar-controls">

        <div className="calendar-control-title">
          <CalendarDays size={18} />

          <div>
            <h2>Calendar Settings</h2>
            <p>
              Configure the observation schedule for your
              location.
            </p>
          </div>
        </div>

        {activeLocation && (
          <div className="active-location-hint">
            <MapPin size={15} />
            Using saved location:{" "}
            <strong>{activeLocation.name}</strong>
          </div>
        )}

        <div className="calendar-input-grid">

          <label>
            Latitude
            <input
              type="number"
              min="-90"
              max="90"
              step="0.0001"
              value={latitude}
              onChange={(event) =>
                setLatitude(event.target.value)
              }
            />
          </label>

          <label>
            Longitude
            <input
              type="number"
              min="-180"
              max="180"
              step="0.0001"
              value={longitude}
              onChange={(event) =>
                setLongitude(event.target.value)
              }
            />
          </label>

          <label>
            Minimum elevation
            <select
              value={minElevation}
              onChange={(event) =>
                setMinElevation(event.target.value)
              }
            >
              <option value="0">0°</option>
              <option value="10">10°</option>
              <option value="20">20°</option>
              <option value="30">30°</option>
              <option value="45">45°</option>
            </select>
          </label>

          <label>
            Calendar range
            <select
              value={days}
              onChange={(event) =>
                setDays(event.target.value)
              }
            >
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </label>

          <button
            type="button"
            className="pass-search-button"
            onClick={() => loadCalendar()}
            disabled={loading}
          >
            {loading
              ? "CALCULATING..."
              : "UPDATE CALENDAR"}
          </button>

        </div>

      </section>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="pass-loading">
          Building observation calendar...
        </div>
      )}

      {!loading &&
        data &&
        data.passes.length === 0 && (
          <div className="pass-empty">
            <Moon size={28} />

            <h2>No passes found</h2>

            <p>
              Try lowering the minimum elevation or
              increasing the calendar range.
            </p>
          </div>
        )}

      {data && data.passes.length > 0 && (
        <section className="calendar-content">

          {Object.entries(groupedPasses).map(
            ([dateKey, passes]) => {

              const bestPass = getBestPass(passes);

              return (
                <section
                  className="calendar-day"
                  key={dateKey}
                >

                  <div className="calendar-day-header">

                    <div>
                      <span>OBSERVATION DAY</span>

                      <h2>
                        {formatDate(
                          passes[0].rise_time
                        )}
                      </h2>
                    </div>

                    <span className="day-pass-count">
                      {passes.length}{" "}
                      {passes.length === 1
                        ? "pass"
                        : "passes"}
                    </span>

                  </div>

                  <div className="calendar-pass-list">

                    {passes.map((pass, index) => (
                      <CalendarPassCard
                        key={`${pass.rise_time}-${index}`}
                        pass={pass}
                        best={
                          bestPass?.rise_time ===
                          pass.rise_time
                        }
                      />
                    ))}

                  </div>

                </section>
              );
            }
          )}

        </section>
      )}

    </main>
  );
}