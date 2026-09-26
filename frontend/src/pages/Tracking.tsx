import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Plus, RefreshCw, Satellite as SatelliteIcon, X } from "lucide-react";

import OrbitGlobe from "../components/globe/OrbitGlobe";
import { getMultiSatelliteTracking } from "../services/trackingService";
import type { Satellite } from "../types/satellite";

const DEFAULT_SATELLITES = [
  "ISS (ZARYA)",
  "CSS (TIANHE)",
  "POISK",
];

export default function Tracking() {
  const [selectedNames, setSelectedNames] =
    useState<string[]>(DEFAULT_SATELLITES);

  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [newSatellite, setNewSatellite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canAddSatellite = useMemo(() => {
    const name = newSatellite.trim();

    return (
      name.length > 0 &&
      !selectedNames.some(
        (item) => item.toLowerCase() === name.toLowerCase()
      )
    );
  }, [newSatellite, selectedNames]);

  async function loadTracking() {
    if (selectedNames.length === 0) {
      setSatellites([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getMultiSatelliteTracking(selectedNames);

      setSatellites(response.satellites);
    } catch (err) {
      console.error(err);
      setError("Unable to load satellite tracking data.");
      setSatellites([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTracking();

    const interval = window.setInterval(() => {
      loadTracking();
    }, 10000);

    return () => window.clearInterval(interval);
  }, [selectedNames]);

  function addSatellite() {
    const name = newSatellite.trim();

    if (!name || !canAddSatellite) {
      return;
    }

    setSelectedNames((current) => [...current, name]);
    setNewSatellite("");
  }

  function removeSatellite(name: string) {
    setSelectedNames((current) =>
      current.filter(
        (item) => item.toLowerCase() !== name.toLowerCase()
      )
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="eyebrow">
            <Activity size={14} />
            LIVE TRACKING
          </div>

          <h1>Multi-Satellite Tracking</h1>

          <p>
            Monitor multiple satellites simultaneously and compare their
            current positions around Earth.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={loadTracking}
          disabled={loading}
        >
          <RefreshCw size={15} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="tracking-layout">
        <section className="tracking-globe-card">
          <div className="card-header">
            <div>
              <span className="card-label">ORBITAL VIEW</span>
              <h2>Live Satellite Positions</h2>
            </div>

            <div className="live-indicator">
              <span className="live-dot" />
              LIVE
            </div>
          </div>

          <div className="tracking-globe">
            {satellites.length > 0 ? (
              <OrbitGlobe satellites={satellites} />
            ) : (
              <div className="empty-globe">
                <SatelliteIcon size={28} />
                <span>No satellite data available</span>
              </div>
            )}
          </div>
        </section>

        <aside className="tracking-panel">
          <div className="card-header">
            <div>
              <span className="card-label">TRACKING LIST</span>
              <h2>Satellites</h2>
            </div>

            <span className="count-badge">
              {selectedNames.length}
            </span>
          </div>

          <div className="add-satellite">
            <input
              type="text"
              value={newSatellite}
              onChange={(event) =>
                setNewSatellite(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  addSatellite();
                }
              }}
              placeholder="Add satellite..."
            />

            <button
              onClick={addSatellite}
              disabled={!canAddSatellite}
              aria-label="Add satellite"
            >
              <Plus size={17} />
            </button>
          </div>

          <div className="tracking-list">
            {selectedNames.map((name) => {
              const satellite = satellites.find(
                (item) =>
                  item.name.toLowerCase() === name.toLowerCase()
              );

              return (
                <div className="tracking-item" key={name}>
                  <div className="tracking-item-icon">
                    <SatelliteIcon size={16} />
                  </div>

                  <div className="tracking-item-info">
                    <strong>{name}</strong>

                    {satellite ? (
                      <span>
                        {satellite.latitude.toFixed(2)}° ·{" "}
                        {satellite.longitude.toFixed(2)}°
                      </span>
                    ) : (
                      <span>Loading position...</span>
                    )}
                  </div>

                  <button
                    className="remove-button"
                    onClick={() => removeSatellite(name)}
                    aria-label={`Remove ${name}`}
                  >
                    <X size={15} />
                  </button>
                </div>
              );
            })}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="tracking-summary">
            <div>
              <span>Tracked</span>
              <strong>{satellites.length}</strong>
            </div>

            <div>
              <span>Update</span>
              <strong>10s</strong>
            </div>
          </div>

          {satellites.length > 0 && (
            <Link
              to={`/satellites/${encodeURIComponent(
                satellites[0].name
              )}`}
              className="view-details-link"
            >
              View satellite details →
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}