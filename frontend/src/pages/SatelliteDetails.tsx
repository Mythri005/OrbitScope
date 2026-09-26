import { useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Heart,
  Satellite,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getOrbitAnalytics,
  getSatelliteDetails,
  type OrbitAnalytics,
  type SatelliteDetails as SatelliteDetailsData,
} from "../services/satelliteDetailsService";

import {
  getSatellite,
} from "../services/satelliteService";

import {
  getSatelliteOrbit,
  type OrbitPoint,
} from "../services/orbitService";

import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../services/favoriteService";

import type {
  Satellite as SatelliteData,
} from "../types/satellite";

import OrbitGlobe from "../components/globe/OrbitGlobe";

export default function SatelliteDetails() {
  const navigate = useNavigate();
  const { satelliteName } = useParams();

  const decodedName = satelliteName
    ? decodeURIComponent(satelliteName)
    : "";

  const [details, setDetails] =
    useState<SatelliteDetailsData | null>(null);

  const [analytics, setAnalytics] =
    useState<OrbitAnalytics | null>(null);

  const [satellite, setSatellite] =
    useState<SatelliteData | null>(null);

  const [orbit, setOrbit] =
    useState<OrbitPoint[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [isFavorite, setIsFavorite] =
    useState(false);

  const [favoriteLoading, setFavoriteLoading] =
    useState(false);

  const [favoriteError, setFavoriteError] =
    useState("");

  useEffect(() => {
    if (!decodedName) {
      setError("Satellite name is missing.");
      setLoading(false);
      return;
    }

    let active = true;

    async function loadSatelliteDetails() {
      try {
        setLoading(true);
        setError("");

        const [
          satelliteDetails,
          orbitAnalytics,
          currentSatellite,
          orbitResponse,
          favorites,
        ] = await Promise.all([
          getSatelliteDetails(decodedName),
          getOrbitAnalytics(decodedName),
          getSatellite(decodedName),
          getSatelliteOrbit(decodedName),
          getFavorites(),
        ]);

        if (!active) {
          return;
        }

        setDetails(satelliteDetails);
        setAnalytics(orbitAnalytics);
        setSatellite(currentSatellite);
        setOrbit(orbitResponse.positions);

        setIsFavorite(
          favorites.some(
            (favorite) =>
              favorite.satellite_name.toLowerCase() ===
              satelliteDetails.name.toLowerCase()
          )
        );
      } catch {
        if (active) {
          setError(
            "Unable to load satellite telemetry."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSatelliteDetails();

    return () => {
      active = false;
    };
  }, [decodedName]);

  async function handleFavoriteToggle() {
    if (!details || favoriteLoading) {
      return;
    }

    try {
      setFavoriteLoading(true);
      setFavoriteError("");

      if (isFavorite) {
        await removeFavorite(details.name);
        setIsFavorite(false);
      } else {
        await addFavorite(details.name);
        setIsFavorite(true);
      }
    } catch {
      setFavoriteError(
        isFavorite
          ? "Unable to remove this satellite from favorites."
          : "Unable to add this satellite to favorites."
      );
    } finally {
      setFavoriteLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="details-state">
        <Activity size={18} />
        <span>
          Loading satellite telemetry...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="details-state error">
        <span>{error}</span>
      </div>
    );
  }

  if (
    !details ||
    !analytics ||
    !satellite
  ) {
    return (
      <div className="details-state">
        <span>
          No satellite data available.
        </span>
      </div>
    );
  }

  return (
    <div className="satellite-details-page">

      {/* Header */}

      <header className="details-header">

        <button
          className="details-back-button"
          onClick={() =>
            navigate("/satellites")
          }
        >
          <ArrowLeft size={15} />
          <span>Satellite Explorer</span>
        </button>

        <div className="details-title-row">

          <div className="details-title-icon">
            <Satellite size={22} />
          </div>

          <div>
            <div className="eyebrow">
              SATELLITE TELEMETRY
            </div>

            <h1>{details.name}</h1>

            <p>
              Orbital characteristics and
              predicted trajectory analytics.
            </p>
          </div>

          <div className="details-title-actions">

            <div className="details-live-status">
              <span className="live-dot" />
              LIVE TLE
            </div>

            <button
              className={`favorite-action-button ${
                isFavorite
                  ? "favorite-action-button-active"
                  : ""
              }`}
              onClick={handleFavoriteToggle}
              disabled={favoriteLoading}
            >
              <Heart
                size={16}
                fill={
                  isFavorite
                    ? "currentColor"
                    : "none"
                }
              />

              {favoriteLoading
                ? "SAVING..."
                : isFavorite
                ? "FAVORITED"
                : "ADD TO FAVORITES"}
            </button>

          </div>

        </div>

        {favoriteError && (
          <div className="favorite-action-error">
            {favoriteError}
          </div>
        )}

      </header>


      {/* Main telemetry */}

      <main className="details-content">

        {/* Orbital Parameters */}

        <section className="details-panel">

          <div className="details-panel-header">

            <div>
              <span className="panel-eyebrow">
                ORBITAL DATA
              </span>

              <h2>
                Orbital Parameters
              </h2>
            </div>

            <Satellite size={18} />

          </div>

          <div className="telemetry-grid">

            <div className="telemetry-card">
              <span>NORAD ID</span>
              <strong>
                {details.norad_id}
              </strong>
            </div>

            <div className="telemetry-card">
              <span>INCLINATION</span>
              <strong>
                {details.inclination.toFixed(2)}°
              </strong>
            </div>

            <div className="telemetry-card">
              <span>ECCENTRICITY</span>
              <strong>
                {details.eccentricity.toFixed(6)}
              </strong>
            </div>

            <div className="telemetry-card">
              <span>MEAN MOTION</span>
              <strong>
                {details.mean_motion.toFixed(4)}
                <small> rev/day</small>
              </strong>
            </div>

            <div className="telemetry-card">
              <span>ORBITAL PERIOD</span>
              <strong>
                {details.orbital_period.toFixed(2)}
                <small> min</small>
              </strong>
            </div>

            <div className="telemetry-card telemetry-card-wide">
              <span>TLE EPOCH</span>
              <strong>
                {new Date(
                  details.epoch
                ).toLocaleString()}
              </strong>
            </div>

          </div>

        </section>


        {/* Orbit Analytics */}

        <section className="details-panel">

          <div className="details-panel-header">

            <div>
              <span className="panel-eyebrow">
                TRAJECTORY ANALYSIS
              </span>

              <h2>
                Orbit Analytics
              </h2>
            </div>

            <Activity size={18} />

          </div>

          <div className="analytics-grid">

            <div className="analytics-card highlight">
              <span>
                AVERAGE ALTITUDE
              </span>

              <strong>
                {analytics.average_altitude.toFixed(2)}
                <small> km</small>
              </strong>

              <div className="analytics-range">
                {analytics.min_altitude.toFixed(2)}
                {" — "}
                {analytics.max_altitude.toFixed(2)}
                {" km"}
              </div>
            </div>

            <div className="analytics-card">
              <span>MIN ALTITUDE</span>

              <strong>
                {analytics.min_altitude.toFixed(2)}
                <small> km</small>
              </strong>
            </div>

            <div className="analytics-card">
              <span>MAX ALTITUDE</span>

              <strong>
                {analytics.max_altitude.toFixed(2)}
                <small> km</small>
              </strong>
            </div>

            <div className="analytics-card">
              <span>LATITUDE RANGE</span>

              <strong>
                {analytics.min_latitude.toFixed(2)}°
                {" → "}
                {analytics.max_latitude.toFixed(2)}°
              </strong>
            </div>

            <div className="analytics-card">
              <span>LONGITUDE RANGE</span>

              <strong>
                {analytics.min_longitude.toFixed(2)}°
                {" → "}
                {analytics.max_longitude.toFixed(2)}°
              </strong>
            </div>

            <div className="analytics-card">
              <span>PREDICTION POINTS</span>

              <strong>
                {analytics.point_count}
              </strong>
            </div>

            <div className="analytics-card">
              <span>ANALYSIS WINDOW</span>

              <strong>
                {analytics.duration_minutes}
                <small> min</small>
              </strong>
            </div>

            <div className="analytics-card">
              <span>
                EST. ORBITAL PERIOD
              </span>

              <strong>
                {analytics.estimated_orbital_period_minutes.toFixed(
                  2
                )}
                <small> min</small>
              </strong>
            </div>

          </div>

        </section>


        {/* Orbit Preview */}

        <section className="details-panel orbit-preview-panel">

          <div className="details-panel-header">

            <div>
              <span className="panel-eyebrow">
                TRAJECTORY VISUALIZATION
              </span>

              <h2>
                Orbit Preview
              </h2>
            </div>

            <div className="orbit-preview-meta">
              <span className="live-dot" />
              PREDICTED PATH
            </div>

          </div>

          <div className="orbit-preview">

            <OrbitGlobe
              satellite={satellite}
              orbit={orbit}
            />

            <div className="orbit-preview-overlay">
              <span>
                {details.name}
              </span>

              <small>
                {orbit.length} trajectory points
              </small>

            </div>

          </div>

          <div className="orbit-preview-footer">

            <div>
              <span>
                CURRENT ALTITUDE
              </span>

              <strong>
                {satellite.altitude.toFixed(2)}
                {" km"}
              </strong>
            </div>

            <div>
              <span>
                CURRENT LATITUDE
              </span>

              <strong>
                {satellite.latitude.toFixed(2)}°
              </strong>
            </div>

            <div>
              <span>
                CURRENT LONGITUDE
              </span>

              <strong>
                {satellite.longitude.toFixed(2)}°
              </strong>
            </div>

            <button
              className="track-live-button"
              onClick={() =>
                navigate(
                  `/?satellite=${encodeURIComponent(
                    details.name
                  )}`
                )
              }
            >
              <Activity size={15} />
              TRACK LIVE
            </button>

            <Link
              to={`/satellites/${encodeURIComponent(
                details.name
              )}/passes`}
              className="details-action-button"
            >
              VIEW PASSES
            </Link>

          </div>

        </section>

      </main>

    </div>
  );
}