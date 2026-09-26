import { useEffect, useState } from "react";
import { Moon, Sun, Clock, MapPin } from "lucide-react";

import { useObserverLocation } from "../context/ObserverLocationContext";
import {
  getNightPlanner,
  type NightPlannerResponse,
} from "../services/nightService";

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NightPlanner() {
  const {
    activeLocation,
    loading: locationLoading,
  } = useObserverLocation();

  const [data, setData] =
    useState<NightPlannerResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activeLocation) {
      setData(null);
      return;
    }

    // Store the ID after the null check.
    // This prevents TypeScript from treating
    // activeLocation as possibly null inside
    // the async function.
    const locationId = activeLocation.id;

    let isActive = true;

    async function loadNightPlanner() {
      try {
        setLoading(true);
        setError("");

        const result =
          await getNightPlanner(locationId);

        if (isActive) {
          setData(result);
        }
      } catch {
        if (isActive) {
          setError(
            "Unable to load night observation data."
          );
          setData(null);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadNightPlanner();

    return () => {
      isActive = false;
    };
  }, [activeLocation?.id]);

  if (locationLoading) {
    return (
      <main className="page-shell">
        <div className="page-loading">
          Loading observer location...
        </div>
      </main>
    );
  }

  if (!activeLocation) {
    return (
      <main className="page-shell">
        <div className="page-header">
          <div className="eyebrow">
            OBSERVATION PLANNER
          </div>

          <h1>Night Planner</h1>

          <p>
            Select an active observer location to
            calculate the darkness window.
          </p>
        </div>

        <div className="page-empty">
          <MapPin size={24} />

          <h2>No active observer location</h2>

          <p>
            Go to Locations and activate an
            observation point first.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            OBSERVATION PLANNER
          </div>

          <h1>Night Planner</h1>

          <p>
            Plan satellite observations around local
            darkness and twilight.
          </p>
        </div>
      </div>

      {/* Active observer location */}
      <section className="night-location-banner">
        <MapPin size={18} />

        <div>
          <span>ACTIVE OBSERVER LOCATION</span>

          <strong>
            {activeLocation.name}
          </strong>

          <small>
            {activeLocation.latitude.toFixed(4)}°,{" "}
            {activeLocation.longitude.toFixed(4)}°
          </small>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && !data && (
        <div className="page-loading">
          Calculating darkness window...
        </div>
      )}

      {/* Night planner data */}
      {data && (
        <>
          <section className="night-status-card">
            <div className="night-status-icon">
              {data.is_dark_now ? (
                <Moon size={28} />
              ) : (
                <Sun size={28} />
              )}
            </div>

            <div>
              <span className="eyebrow">
                CURRENT CONDITIONS
              </span>

              <h2>
                {data.is_dark_now
                  ? "It is dark now"
                  : "It is not dark now"}
              </h2>

              <p>
                {data.location_name}
              </p>
            </div>

            <div className="night-duration">
              <Clock size={18} />

              <strong>
                {Math.round(
                  data.darkness_duration_minutes
                )}{" "}
                min
              </strong>

              <span>darkness</span>
            </div>
          </section>

          <section className="night-grid">
            <div className="night-card">
              <span>🌇 SUNSET</span>

              <strong>
                {formatTime(data.sunset)}
              </strong>
            </div>

            <div className="night-card">
              <span>🌅 SUNRISE</span>

              <strong>
                {formatTime(data.sunrise)}
              </strong>
            </div>

            <div className="night-card">
              <span>
                CIVIL TWILIGHT END
              </span>

              <strong>
                {formatTime(
                  data.civil_twilight_end
                )}
              </strong>
            </div>

            <div className="night-card">
              <span>
                NAUTICAL TWILIGHT END
              </span>

              <strong>
                {formatTime(
                  data.nautical_twilight_end
                )}
              </strong>
            </div>

            <div className="night-card">
              <span>
                ASTRONOMICAL TWILIGHT BEGIN
              </span>

              <strong>
                {formatTime(
                  data.astronomical_twilight_begin
                )}
              </strong>
            </div>

            <div className="night-card">
              <span>
                ASTRONOMICAL TWILIGHT END
              </span>

              <strong>
                {formatTime(
                  data.astronomical_twilight_end
                )}
              </strong>
            </div>
          </section>
        </>
      )}
    </main>
  );
}