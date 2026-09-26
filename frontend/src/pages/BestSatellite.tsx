import { useEffect, useState } from "react";
import {
  Activity,
  MapPin,
  Satellite,
  Clock3,
  Eye,
  Star,
} from "lucide-react";

import { useObserverLocation } from "../context/ObserverLocationContext";

import {
  getBestSatellite,
  type BestSatelliteResponse,
} from "../services/bestSatelliteService";

import { getSatellites } from "../services/satelliteService";

export default function BestSatellite() {
  const { activeLocation, loading: locationLoading } =
    useObserverLocation();

  const [satelliteNames, setSatelliteNames] = useState<string[]>([]);
  const [result, setResult] =
    useState<BestSatelliteResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [satellitesLoading, setSatellitesLoading] =
    useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSatellites() {
      try {
        setSatellitesLoading(true);

        const response = await getSatellites();

        setSatelliteNames(response.satellites);
      } catch {
        setError("Unable to load satellite list.");
      } finally {
        setSatellitesLoading(false);
      }
    }

    void loadSatellites();
  }, []);

  async function findBestSatellite() {
    if (!activeLocation) {
      setError(
        "Please create or select an observer location first."
      );
      return;
    }

    if (satelliteNames.length === 0) {
      setError("No satellites are available to compare.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await getBestSatellite(
        satelliteNames,
        activeLocation.latitude,
        activeLocation.longitude,
        24,
        0
      );

      setResult(response);
    } catch {
      setError(
        "Unable to determine the best satellite right now."
      );
    } finally {
      setLoading(false);
    }
  }

  const pass = result?.pass_details;

  return (
    <div className="best-satellite-page">

      {/* Header */}

      <header className="best-satellite-header">

        <div>
          <div className="eyebrow">
            OBSERVATION INTELLIGENCE
          </div>

          <h1>
            Best Satellite
          </h1>

          <p>
            Find the satellite with the strongest
            viewing opportunity from your active
            observer location.
          </p>
        </div>

        <button
          className="best-satellite-action"
          onClick={findBestSatellite}
          disabled={
            loading ||
            satellitesLoading ||
            locationLoading ||
            !activeLocation
          }
        >
          <Activity size={16} />

          {loading
            ? "ANALYZING..."
            : "FIND BEST SATELLITE"}
        </button>

      </header>


      {/* Active location */}

      <section className="best-location-panel">

        <div className="best-location-icon">
          <MapPin size={18} />
        </div>

        <div>
          <span className="panel-eyebrow">
            ACTIVE OBSERVER
          </span>

          {locationLoading ? (
            <strong>
              Loading location...
            </strong>
          ) : activeLocation ? (
            <>
              <strong>
                {activeLocation.name}
              </strong>

              <span>
                {activeLocation.latitude.toFixed(4)}°
                {" , "}
                {activeLocation.longitude.toFixed(4)}°
              </span>
            </>
          ) : (
            <strong>
              No observer location selected
            </strong>
          )}
        </div>

      </section>


      {/* Error */}

      {error && (
        <div className="best-satellite-error">
          {error}
        </div>
      )}


      {/* Empty state */}

      {!result && !loading && !error && (
        <section className="best-satellite-empty">

          <div className="best-empty-icon">
            <Satellite size={30} />
          </div>

          <h2>
            Ready to analyze
          </h2>

          <p>
            OrbitScope will compare available
            satellites across the next 24 hours
            from your active observer location.
          </p>

        </section>
      )}


      {/* Loading */}

      {loading && (
        <section className="best-satellite-empty">

          <div className="best-empty-icon">
            <Activity size={30} />
          </div>

          <h2>
            Analyzing orbital opportunities...
          </h2>

          <p>
            Checking upcoming satellite passes,
            elevation and visibility conditions.
          </p>

        </section>
      )}


      {/* Result */}

      {result && pass && (
        <section className="best-result-panel">

          <div className="best-result-header">

            <div>
              <span className="panel-eyebrow">
                RECOMMENDED OBSERVATION
              </span>

              <h2>
                {result.satellite_name}
              </h2>

              <p>
                {result.reason}
              </p>
            </div>

            <div className="best-score">

              <Star size={17} />

              <strong>
                {result.score.toFixed(2)}
              </strong>

              <span>
                SCORE
              </span>

            </div>

          </div>


          {/* Recommendation */}

          <div className="best-recommendation">

            <div>
              <span>
                OBSERVATION STATUS
              </span>

              <strong>
                {pass.recommendation}
              </strong>
            </div>

            <div>
              <span>
                VISIBILITY
              </span>

              <strong>
                {pass.visibility}
              </strong>
            </div>

            <div>
              <span>
                QUALITY
              </span>

              <strong>
                {pass.quality}
              </strong>
            </div>

          </div>


          {/* Pass details */}

          <div className="best-pass-grid">

            <div className="best-pass-card">

              <Clock3 size={17} />

              <span>
                RISE TIME
              </span>

              <strong>
                {new Date(
                  pass.rise_time
                ).toLocaleString()}
              </strong>

            </div>


            <div className="best-pass-card">

              <Clock3 size={17} />

              <span>
                CULMINATION
              </span>

              <strong>
                {new Date(
                  pass.culmination_time
                ).toLocaleString()}
              </strong>

            </div>


            <div className="best-pass-card">

              <Clock3 size={17} />

              <span>
                SET TIME
              </span>

              <strong>
                {new Date(
                  pass.set_time
                ).toLocaleString()}
              </strong>

            </div>


            <div className="best-pass-card">

              <Eye size={17} />

              <span>
                MAX ELEVATION
              </span>

              <strong>
                {pass.max_elevation.toFixed(2)}°
              </strong>

            </div>


            <div className="best-pass-card">

              <Activity size={17} />

              <span>
                PASS DURATION
              </span>

              <strong>
                {pass.duration_minutes.toFixed(1)}
                {" min"}
              </strong>

            </div>


            <div className="best-pass-card">

              <Satellite size={17} />

              <span>
                SUNLIT
              </span>

              <strong>
                {pass.is_sunlit
                  ? "YES"
                  : "NO"}
              </strong>

            </div>


            <div className="best-pass-card">

              <MapPin size={17} />

              <span>
                OBSERVER DARKNESS
              </span>

              <strong>
                {pass.is_observer_in_darkness
                  ? "YES"
                  : "NO"}
              </strong>

            </div>

          </div>

        </section>
      )}

    </div>
  );
}