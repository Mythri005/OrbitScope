import { useEffect, useState } from "react";
import {
  Activity,
  Clock3,
  MapPin,
  RefreshCw,
  Satellite,
  Save,
} from "lucide-react";

import {
  getSatelliteHistory,
  recordSatelliteHistory,
  type HistoricalRecord,
} from "../services/historyService";

import {
  getSatellites,
} from "../services/satelliteService";

export default function HistoricalTracking() {
  const [satellites, setSatellites] = useState<string[]>([]);
  const [selectedSatellite, setSelectedSatellite] =
    useState("ISS");

  const [records, setRecords] = useState<
    HistoricalRecord[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [satellitesLoading, setSatellitesLoading] =
    useState(true);

  const [error, setError] = useState("");

  async function loadSatellites() {
    try {
      setSatellitesLoading(true);
      setError("");

      const response = await getSatellites();

      setSatellites(response.satellites);

      if (
        response.satellites.length > 0 &&
        !response.satellites.includes(selectedSatellite)
      ) {
        setSelectedSatellite(response.satellites[0]);
      }
    } catch {
      setError("Unable to load satellite catalog.");
    } finally {
      setSatellitesLoading(false);
    }
  }

  async function loadHistory(
    satelliteName: string = selectedSatellite
  ) {
    try {
      setLoading(true);
      setError("");

      const history =
        await getSatelliteHistory(satelliteName);

      setRecords(history);
    } catch {
      setError(
        `Unable to load historical data for ${satelliteName}.`
      );
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }

  async function recordCurrentPosition() {
    try {
      setRecording(true);
      setError("");

      await recordSatelliteHistory(selectedSatellite);

      await loadHistory(selectedSatellite);
    } catch {
      setError(
        `Unable to record ${selectedSatellite} position.`
      );
    } finally {
      setRecording(false);
    }
  }

  useEffect(() => {
    void loadSatellites();
  }, []);

  useEffect(() => {
    if (!satellitesLoading && selectedSatellite) {
      void loadHistory(selectedSatellite);
    }
  }, [selectedSatellite, satellitesLoading]);

  const latestRecord =
    records.length > 0
      ? records[records.length - 1]
      : null;

  return (
    <div className="historical-page">

      {/* Header */}

      <header className="historical-header">

        <div>
          <div className="eyebrow">
            ORBITAL HISTORY
          </div>

          <h1>
            Historical Tracking
          </h1>

          <p>
            Review previously recorded satellite
            positions and orbital movement.
          </p>
        </div>

        <div className="historical-actions">

          <button
            className="historical-button secondary"
            onClick={() => loadHistory()}
            disabled={loading || !selectedSatellite}
          >
            <RefreshCw
              size={15}
              className={loading ? "spin" : ""}
            />

            Refresh
          </button>

          <button
            className="historical-button primary"
            onClick={recordCurrentPosition}
            disabled={
              recording ||
              satellitesLoading ||
              !selectedSatellite
            }
          >
            <Save size={15} />

            {recording
              ? "Recording..."
              : "Record Current Position"}
          </button>

        </div>

      </header>


      {/* Satellite selector */}

      <section className="historical-selector">

        <div className="historical-selector-icon">
          <Satellite size={18} />
        </div>

        <div className="historical-selector-content">

          <label htmlFor="historical-satellite">
            SELECT SATELLITE
          </label>

          <select
            id="historical-satellite"
            value={selectedSatellite}
            onChange={(event) =>
              setSelectedSatellite(
                event.target.value
              )
            }
            disabled={satellitesLoading}
          >
            {satellites.map((satellite) => (
              <option
                key={satellite}
                value={satellite}
              >
                {satellite}
              </option>
            ))}
          </select>

        </div>

      </section>


      {/* Error */}

      {error && (
        <div className="historical-error">
          {error}
        </div>
      )}


      {/* Summary */}

      <section className="historical-summary">

        <div className="historical-summary-card">

          <div className="historical-summary-icon">
            <Activity size={17} />
          </div>

          <div>
            <span className = "start-label">
              OBSERVATIONS
            </span>

            <strong className = "start-value">
              {records.length}
            </strong>
          </div>

        </div>


        <div className="historical-summary-card">

          <div className="historical-summary-icon">
            <MapPin size={17} />
          </div>

          <div>
            <span className="stat-label">
              LATEST LATITUDE
            </span>

            <strong className="stat-value">
              {latestRecord
                ? `${latestRecord.latitude.toFixed(2)}°`
                : "—"}
            </strong>
          </div>

        </div>


        <div className="historical-summary-card">

          <div className="historical-summary-icon">
            <MapPin size={17} />
          </div>

          <div>
            <span className="stat-label">
              LATEST LONGITUDE
            </span>

            <strong className="stat-value">
              {latestRecord
                ? `${latestRecord.longitude.toFixed(2)}°`
                : "—"}
            </strong>
          </div>

        </div>


        <div className="historical-summary-card">

          <div className="historical-summary-icon">
            <Satellite size={17} />
          </div>

          <div>
            <span className="stat-label">
              LATEST ALTITUDE
            </span>

            <strong className="stat-value">
              {latestRecord
                ? `${latestRecord.altitude.toFixed(1)} km`
                : "—"}
            </strong>
          </div>

        </div>

      </section>


      {/* Latest observation */}

      {latestRecord && (
        <section className="historical-latest">

          <div className="historical-latest-header">

            <div>
              <div className="eyebrow">
                LATEST OBSERVATION
              </div>

              <h2>
                {latestRecord.satellite_name}
              </h2>
            </div>

            <div className="historical-time">
              <Clock3 size={14} />

              {new Date(
                latestRecord.timestamp
              ).toLocaleString()}
            </div>

          </div>

          <div className="historical-latest-grid">

            <div>
              <span>LATITUDE</span>
              <strong>
                {latestRecord.latitude.toFixed(4)}°
              </strong>
            </div>

            <div>
              <span>LONGITUDE</span>
              <strong>
                {latestRecord.longitude.toFixed(4)}°
              </strong>
            </div>

            <div>
              <span>ALTITUDE</span>
              <strong>
                {latestRecord.altitude.toFixed(2)} km
              </strong>
            </div>

          </div>

        </section>
      )}


      {/* History table */}

      <section className="historical-table-panel">

        <div className="historical-table-header">

          <div>
            <div className="eyebrow">
              RECORDED DATA
            </div>

            <h2>
              Position History
            </h2>
          </div>

          <span className="historical-count">
            {records.length} records
          </span>

        </div>


        {loading ? (
          <div className="historical-empty">
            Loading historical observations...
          </div>
        ) : records.length === 0 ? (
          <div className="historical-empty">
            No historical observations recorded
            for this satellite yet.
          </div>
        ) : (
          <div className="historical-table-wrapper">

            <table className="historical-table">

              <thead>
                <tr>
                  <th>#</th>
                  <th>Timestamp</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Altitude</th>
                </tr>
              </thead>

              <tbody>
                {[...records]
                  .reverse()
                  .map((record, index) => (
                    <tr key={record.id}>

                      <td>
                        {records.length - index}
                      </td>

                      <td>
                        {new Date(
                          record.timestamp
                        ).toLocaleString()}
                      </td>

                      <td>
                        {record.latitude.toFixed(4)}°
                      </td>

                      <td>
                        {record.longitude.toFixed(4)}°
                      </td>

                      <td>
                        {record.altitude.toFixed(2)} km
                      </td>

                    </tr>
                  ))}
              </tbody>

            </table>

          </div>
        )}

      </section>

    </div>
  );
}