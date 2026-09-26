import {
  useEffect,
  useState,
} from "react";

import {
  Activity,
  ArrowLeft,
  Search,
  Satellite as SatelliteIcon,
} from "lucide-react";

import {
  getSatellites,
} from "../services/satelliteService";

import {
  useNavigate,
} from "react-router-dom";

export default function Satellites() {
  const navigate = useNavigate();

  const [satellites, setSatellites] =
    useState<string[]>([]);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    async function loadSatellites() {
      try {
        setLoading(true);
        setError("");

        const result =
          await getSatellites();

        if (active) {
          setSatellites(result.satellites);
        }
      } catch {
        if (active) {
          setError(
            "Unable to load the satellite catalog."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadSatellites();

    return () => {
      active = false;
    };
  }, []);

  const filteredSatellites =
    satellites.filter((name) =>
      name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

  return (
    <div className="explorer-page">
      <header className="explorer-header">
        <div>
          <div className="eyebrow">
            ORBITAL CATALOG
          </div>

          <h1>Satellite Explorer</h1>

          <p>
            Browse the live satellite catalog
            available to OrbitScope.
          </p>
        </div>

        <div className="catalog-count">
          <span>CATALOG</span>
          <strong>{satellites.length}</strong>
          <small>objects</small>
        </div>
      </header>

      <div className="explorer-toolbar">
        <div className="explorer-search">
          <Search size={16} />

          <input
            type="text"
            placeholder="Search satellite catalog..."
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(event.target.value)
            }
          />
        </div>
      </div>

      {loading && (
        <div className="explorer-state">
          <Activity size={18} />

          <span>
            Loading orbital catalog...
          </span>
        </div>
      )}

      {!loading && error && (
        <div className="explorer-state error">
          <span>{error}</span>
        </div>
      )}

      {!loading &&
        !error &&
        filteredSatellites.length === 0 && (
          <div className="explorer-state">
            <span>
              No satellites match your search.
            </span>
          </div>
        )}

      {!loading && !error && (
        <div className="satellite-grid">
          {filteredSatellites.map(
            (satelliteName) => (
              <button
                key={satelliteName}
                className="satellite-card"
                onClick={() =>
                    navigate(
                        `/satellites/${encodeURIComponent(satelliteName)}`
                    )
                }
                >
                <div className="satellite-card-icon">
                    <SatelliteIcon size={20} />
                </div>

                <div className="satellite-card-content">
                    <strong>
                    {satelliteName}
                    </strong>

                    <span>
                    LIVE TLE OBJECT
                    </span>
                </div>

                <ArrowLeft
                    size={16}
                    className="satellite-card-arrow"
                />
            </button>
            )
          )}
        </div>
      )}
    </div>
  );
}