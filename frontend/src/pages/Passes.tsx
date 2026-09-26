import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Eye,
  MapPin,
  Moon,
  Satellite as SatelliteIcon,
  Sun,
  Target,
} from "lucide-react";

import {
  getSatellitePasses,
  type PassPredictionResponse,
  type SatellitePass,
} from "../services/passService";

import { useObserverLocation } from "../context/ObserverLocationContext";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDuration(minutes: number) {
  return `${minutes.toFixed(1)} min`;
}

function PassCard({
  pass,
  best = false,
}: {
  pass: SatellitePass;
  best?: boolean;
}) {
  return (
    <div className={`pass-card ${best ? "pass-card-best" : ""}`}>
      <div className="pass-card-header">
        <div>
          <span className="pass-label">
            {best ? "BEST PASS" : "UPCOMING PASS"}
          </span>
          <h3>{formatDateTime(pass.rise_time)}</h3>
        </div>

        <div className="pass-elevation">
          <Target size={18} />
          <strong>{pass.max_elevation.toFixed(1)}°</strong>
          <span>max elevation</span>
        </div>
      </div>

      <div className="pass-timeline">
        <div>
          <span>RISE</span>
          <strong>{formatDateTime(pass.rise_time)}</strong>
        </div>

        <div>
          <span>PEAK</span>
          <strong>{formatDateTime(pass.culmination_time)}</strong>
        </div>

        <div>
          <span>SET</span>
          <strong>{formatDateTime(pass.set_time)}</strong>
        </div>
      </div>

      <div className="pass-metrics">
        <div>
          <Clock3 size={16} />
          <span>Duration</span>
          <strong>{formatDuration(pass.duration_minutes)}</strong>
        </div>

        <div>
          <Eye size={16} />
          <span>Visibility</span>
          <strong>{pass.visibility}</strong>
        </div>

        <div>
          <Target size={16} />
          <span>Quality</span>
          <strong>{pass.quality}</strong>
        </div>

        <div>
          {pass.is_sunlit ? <Sun size={16} /> : <Moon size={16} />}
          <span>Satellite</span>
          <strong>{pass.is_sunlit ? "Sunlit" : "Shadow"}</strong>
        </div>

        <div>
          {pass.is_observer_in_darkness ? (
            <Moon size={16} />
          ) : (
            <Sun size={16} />
          )}
          <span>Observer</span>
          <strong>
            {pass.is_observer_in_darkness ? "Darkness" : "Daylight"}
          </strong>
        </div>
      </div>

      <div className="pass-recommendation">
        <strong>Recommendation</strong>
        <p>{pass.recommendation}</p>
      </div>
    </div>
  );
}

export default function Passes() {
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
  const [minElevation, setMinElevation] = useState("10");
  const [hours, setHours] = useState("24");

  const [data, setData] = useState<PassPredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activeLocation) return;

    setLatitude(String(activeLocation.latitude));
    setLongitude(String(activeLocation.longitude));
  }, [activeLocation]);

  async function loadPasses(
    selectedLatitude = latitude,
    selectedLongitude = longitude
  ) {
    if (!decodedName) return;

    setLoading(true);
    setError("");

    try {
      const result = await getSatellitePasses(decodedName, {
        lat: Number(selectedLatitude),
        lon: Number(selectedLongitude),
        min_elevation: Number(minElevation),
        hours: Number(hours),
        sort_by: "time",
        limit: 10,
      });

      setData(result);
    } catch (err) {
      console.error(err);
      setError("Unable to load satellite passes.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!decodedName) return;

    if (activeLocation) {
      loadPasses(
        String(activeLocation.latitude),
        String(activeLocation.longitude)
      );
    } else {
      loadPasses();
    }
  }, [decodedName, activeLocation?.id]);

  return (
    <main className="passes-page">
      <div className="passes-topbar">
        <Link
            to={`/satellites/${encodeURIComponent(decodedName)}`}
            className="back-link"
        >
            <ArrowLeft size={17} />
            Back to satellite
        </Link>
        <div className="passes-title">
            <SatelliteIcon size={24} />

            <div>
            <span>PASS PREDICTION</span>
            <h1>{decodedName}</h1>
            </div>
        </div>
        <Link
            to={`/satellites/${encodeURIComponent(
            decodedName
            )}/passes/calendar`}
            className="details-action-button"
        >
            <CalendarDays size={15} />
            VIEW CALENDAR
        </Link>
      </div>

      <section className="pass-controls">
        <div className="control-heading">
          <MapPin size={19} />
          <div>
            <h2>Observer Location</h2>
            <p>Set the location from which you want to observe.</p>
          </div>
        </div>

        {activeLocation && (
          <div className="active-location-hint">
            <MapPin size={15} />
            Using saved location:{" "}
            <strong>{activeLocation.name}</strong>
          </div>
        )}

        <div className="pass-input-grid">
          <label>
            Latitude
            <input
              type="number"
              min="-90"
              max="90"
              step="0.0001"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
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
              onChange={(e) => setLongitude(e.target.value)}
            />
          </label>

          <label>
            Min elevation
            <select
              value={minElevation}
              onChange={(e) => setMinElevation(e.target.value)}
            >
              <option value="0">0°</option>
              <option value="10">10°</option>
              <option value="20">20°</option>
              <option value="30">30°</option>
              <option value="45">45°</option>
            </select>
          </label>

          <label>
            Prediction window
            <select
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            >
              <option value="6">6 hours</option>
              <option value="12">12 hours</option>
              <option value="24">24 hours</option>
            </select>
          </label>

          <button
            type="button"
            className="pass-search-button"
            onClick={() => loadPasses()}
            disabled={loading}
          >
            {loading ? "CALCULATING..." : "FIND PASSES"}
          </button>
        </div>
      </section>

      {error && <div className="page-error">{error}</div>}

      {loading && !data && (
        <div className="pass-loading">
          Calculating orbital passes...
        </div>
      )}

      {!loading && data && data.passes.length === 0 && (
        <div className="pass-empty">
          <Moon size={28} />
          <h2>No visible passes found</h2>
          <p>
            Try lowering the minimum elevation or increasing the prediction
            window.
          </p>
        </div>
      )}

      {data && data.passes.length > 0 && (
        <>
          <section className="best-pass-section">
            <div className="section-heading">
              <div>
                <span>OPTIMAL OBSERVATION</span>
                <h2>Best pass</h2>
              </div>
              <span className="pass-count">
                {data.passes.length} passes found
              </span>
            </div>

            <PassCard pass={data.best_pass} best />
          </section>

          <section className="upcoming-passes-section">
            <div className="section-heading">
              <div>
                <span>PASS WINDOW</span>
                <h2>Upcoming passes</h2>
              </div>
            </div>

            <div className="passes-list">
              {data.passes.map((pass, index) => (
                <PassCard
                  key={`${pass.rise_time}-${index}`}
                  pass={pass}
                  best={index === data.best_pass_index}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}