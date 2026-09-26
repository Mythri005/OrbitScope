import { useEffect, useState } from "react";
import {
  Bell,
  BellOff,
  Plus,
  Trash2,
  Satellite,
  MapPin,
} from "lucide-react";

import {
  createPassAlert,
  deletePassAlert,
  getPassAlerts,
  updatePassAlert,
  type PassAlert,
} from "../services/passAlertService";

import { useObserverLocation } from "../context/ObserverLocationContext";

export default function PassAlerts() {
  const {
    locations,
    activeLocation,
  } = useObserverLocation();

  const [alerts, setAlerts] = useState<PassAlert[]>([]);

  const [satelliteName, setSatelliteName] =
    useState("ISS");

  const [locationId, setLocationId] =
    useState<number | "">("");

  const [minElevation, setMinElevation] =
    useState("10");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [changingId, setChangingId] =
    useState<number | null>(null);

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadAlerts() {
      try {
        setLoading(true);
        setError("");

        const result = await getPassAlerts();

        setAlerts(result);
      } catch {
        setError(
          "Unable to load your pass alerts."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, []);

  useEffect(() => {
    if (activeLocation) {
      setLocationId(activeLocation.id);
    } else if (
      locations.length > 0 &&
      locationId === ""
    ) {
      setLocationId(locations[0].id);
    }
  }, [activeLocation, locations, locationId]);

  function getLocationName(
    id: number
  ) {
    const location = locations.find(
      (item) => item.id === id
    );

    return location?.name ?? `Location #${id}`;
  }

  async function handleCreateAlert(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!satelliteName.trim()) {
      setError(
        "Please enter a satellite name."
      );
      return;
    }

    if (locationId === "") {
      setError(
        "Please select an observer location."
      );
      return;
    }

    const elevation =
      Number(minElevation);

    if (
      Number.isNaN(elevation) ||
      elevation < 0 ||
      elevation > 90
    ) {
      setError(
        "Minimum elevation must be between 0° and 90°."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const newAlert =
        await createPassAlert({
          satellite_name:
            satelliteName.trim(),
          location_id: locationId,
          min_elevation: elevation,
        });

      setAlerts((current) => [
        newAlert,
        ...current,
      ]);

      setSatelliteName("ISS");
      setMinElevation("10");
    } catch {
      setError(
        "Unable to create the pass alert."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(
    alert: PassAlert
  ) {
    try {
      setChangingId(alert.id);
      setError("");

      const updated =
        await updatePassAlert(
          alert.id,
          !alert.enabled
        );

      setAlerts((current) =>
        current.map((item) =>
          item.id === alert.id
            ? updated
            : item
        )
      );
    } catch {
      setError(
        "Unable to update the pass alert."
      );
    } finally {
      setChangingId(null);
    }
  }

  async function handleDelete(
    alert: PassAlert
  ) {
    try {
      setDeletingId(alert.id);
      setError("");

      await deletePassAlert(alert.id);

      setAlerts((current) =>
        current.filter(
          (item) => item.id !== alert.id
        )
      );
    } catch {
      setError(
        "Unable to delete the pass alert."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="page-shell">

      <div className="page-header">
        <div>
          <div className="eyebrow">
            OBSERVATION ALERTS
          </div>

          <h1>Pass Alerts</h1>

          <p>
            Get notified when a satellite has a
            visible pass from one of your observer
            locations.
          </p>
        </div>
      </div>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      {/* Create alert */}

      <section className="alerts-create-panel">

        <div className="alerts-section-header">

          <div>
            <span className="panel-eyebrow">
              NEW ALERT
            </span>

            <h2>
              Create a Pass Alert
            </h2>
          </div>

          <Bell size={20} />

        </div>

        <form
          className="alert-form"
          onSubmit={handleCreateAlert}
        >

          <label>
            <span>Satellite</span>

            <div className="alert-input-wrapper">
              <Satellite size={16} />

              <input
                type="text"
                value={satelliteName}
                onChange={(event) =>
                  setSatelliteName(
                    event.target.value
                  )
                }
                placeholder="ISS"
              />
            </div>
          </label>


          <label>
            <span>Observer Location</span>

            <div className="alert-input-wrapper">
              <MapPin size={16} />

              <select
                value={locationId}
                onChange={(event) =>
                  setLocationId(
                    event.target.value
                      ? Number(
                          event.target.value
                        )
                      : ""
                  )
                }
              >
                <option value="">
                  Select location
                </option>

                {locations.map(
                  (location) => (
                    <option
                      key={location.id}
                      value={location.id}
                    >
                      {location.name}
                    </option>
                  )
                )}
              </select>
            </div>
          </label>


          <label>
            <span>
              Minimum Elevation
            </span>

            <div className="alert-input-wrapper">
              <input
                type="number"
                min="0"
                max="90"
                step="1"
                value={minElevation}
                onChange={(event) =>
                  setMinElevation(
                    event.target.value
                  )
                }
              />

              <span className="input-unit">
                °
              </span>
            </div>
          </label>


          <button
            type="submit"
            className="primary-button alert-create-button"
            disabled={saving}
          >
            <Plus size={16} />

            {saving
              ? "Creating..."
              : "Create Alert"}
          </button>

        </form>

        {activeLocation && (
          <div className="alert-location-hint">
            Using active observer location:{" "}
            <strong>
              {activeLocation.name}
            </strong>
          </div>
        )}

      </section>


      {/* Alert list */}

      <section className="alerts-list-section">

        <div className="alerts-section-header">

          <div>
            <span className="panel-eyebrow">
              YOUR ALERTS
            </span>

            <h2>
              Saved Pass Alerts
            </h2>
          </div>

          <span className="alerts-count">
            {alerts.length}{" "}
            {alerts.length === 1
              ? "alert"
              : "alerts"}
          </span>

        </div>


        {loading ? (
          <div className="page-loading">
            Loading your pass alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="page-empty">
            <Bell size={28} />

            <h2>
              No pass alerts yet
            </h2>

            <p>
              Create an alert to keep track of
              useful satellite passes.
            </p>
          </div>
        ) : (
          <div className="alerts-list">

            {alerts.map((alert) => (
              <article
                key={alert.id}
                className={`alert-card ${
                  alert.enabled
                    ? "enabled"
                    : "disabled"
                }`}
              >

                <div className="alert-card-icon">
                  {alert.enabled ? (
                    <Bell size={20} />
                  ) : (
                    <BellOff size={20} />
                  )}
                </div>


                <div className="alert-card-content">

                  <div className="alert-card-title-row">

                    <h3>
                      {alert.satellite_name}
                    </h3>

                    <span
                      className={`alert-status ${
                        alert.enabled
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {alert.enabled
                        ? "ACTIVE"
                        : "DISABLED"}
                    </span>

                  </div>


                  <div className="alert-card-meta">

                    <span>
                      <MapPin size={13} />

                      {getLocationName(
                        alert.location_id
                      )}
                    </span>

                    <span>
                      Minimum elevation{" "}
                      <strong>
                        {alert.min_elevation}°
                      </strong>
                    </span>

                  </div>

                </div>


                <div className="alert-card-actions">

                  <button
                    className="alert-toggle-button"
                    onClick={() =>
                      handleToggle(alert)
                    }
                    disabled={
                      changingId === alert.id
                    }
                  >
                    {changingId === alert.id
                      ? "Updating..."
                      : alert.enabled
                        ? "Disable"
                        : "Enable"}
                  </button>


                  <button
                    className="favorite-remove-button"
                    onClick={() =>
                      handleDelete(alert)
                    }
                    disabled={
                      deletingId === alert.id
                    }
                    title="Delete alert"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

              </article>
            ))}

          </div>
        )}

      </section>

    </main>
  );
}