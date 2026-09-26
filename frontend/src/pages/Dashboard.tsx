import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  Activity,
  Bell,
  Clock3,
  GitCompare,
  Globe2,
  Heart,
  MapPin,
  Moon,
  Satellite,
  Search,
  Star,
} from "lucide-react";

import OrbitGlobe from "../components/globe/OrbitGlobe";
import {
  getSatellite,
  getSatellites,
  searchSatellites,
} from "../services/satelliteService";

import { getFavorites } from "../services/favoriteService";

import { useObserverLocation } from "../context/ObserverLocationContext";

import { getSatelliteOrbit } from "../services/orbitService";

import {
  getSatellitePasses,
  type SatellitePass,
} from "../services/passService";

import type { Satellite as SatelliteData } from "../types/satellite";
import type { OrbitPoint } from "../services/orbitService";

function StatCard({
  icon,
  label,
  value,
  status,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  status?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`stat-card ${onClick ? "stat-card-clickable" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (
          onClick &&
          (event.key === "Enter" || event.key === " ")
        ) {
          onClick();
        }
      }}
    >
      <div className="stat-icon">{icon}</div>

      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>

      {status && (
        <span className="stat-status">{status}</span>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const {
    activeLocation,
  } = useObserverLocation();

  const [searchParams] = useSearchParams();

  const satelliteFromUrl =
    searchParams.get("satellite");

  const [selectedSatellite, setSelectedSatellite] =
    useState<SatelliteData | null>({
      name: satelliteFromUrl || "ISS",
      latitude: 0,
      longitude: 0,
      altitude: 0,
    });


  const [orbit, setOrbit] = useState<OrbitPoint[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [searchResults, setSearchResults] =
    useState<string[]>([]);

  const [searching, setSearching] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [satelliteCount, setSatelliteCount] =
    useState(0);

  const [favoriteCount, setFavoriteCount] =
    useState(0);

  const [statsLoading, setStatsLoading] =
    useState(true);

  const [dashboardPasses, setDashboardPasses] =
    useState<
      {
        name: string;
        pass: SatellitePass;
      }[]
    >([]);

  const [nextVisiblePass, setNextVisiblePass] =
    useState<SatellitePass | null>(null);

  const [passesLoading, setPassesLoading] =
    useState(true);

  useEffect(() => {
    let active = true;

    async function loadSelectedSatellite() {
      if (!selectedSatellite) {
        return;
      }

      try {
        setError("");

        const satellite = await getSatellite(
          selectedSatellite.name
        );

        if (active) {
          setSelectedSatellite(satellite);
          setLoading(false);
        }
      } catch {
        if (active) {
          setError(
            `Unable to load ${selectedSatellite.name} data.`
          );
          setLoading(false);
        }
      }
    }

    loadSelectedSatellite();

    const interval = window.setInterval(
      loadSelectedSatellite,
      10000
    );

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [selectedSatellite?.name]);

  useEffect(() => {
    if (!selectedSatellite) {
      return;
    }

    const satelliteName = selectedSatellite.name;

    let active = true;

    async function loadOrbit() {
      try {
        const orbitData =
          await getSatelliteOrbit(satelliteName);

        if (active) {
          setOrbit(orbitData.positions);
        }
      } catch {
        if (active) {
          setOrbit([]);
        }
      }
    }

    loadOrbit();

    return () => {
      active = false;
    };
  }, [selectedSatellite?.name]);


  useEffect(() => {
    const query = searchQuery.trim();

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    let active = true;

    const timer = window.setTimeout(async () => {
      try {
        setSearching(true);

        const result = await searchSatellites(query);

        if (active) {
          setSearchResults(result.satellites.slice(0, 8));
        }
      } catch {
        if (active) {
          setSearchResults([]);
        }
      } finally {
        if (active) {
          setSearching(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  useEffect(() => {
    let active = true;

    async function loadDashboardStats() {
      try {
        setStatsLoading(true);

        const [
          satelliteResponse,
          favoriteResponse,
        ] = await Promise.all([
          getSatellites(),
          getFavorites(),
        ]);

        if (!active) {
          return;
        }

        setSatelliteCount(
          satelliteResponse.count
        );

        setFavoriteCount(
          favoriteResponse.length
        );
      } catch {
        if (active) {
          setSatelliteCount(0);
          setFavoriteCount(0);
        }
      } finally {
        if (active) {
          setStatsLoading(false);
        }
      }
    }

    void loadDashboardStats();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadDashboardPasses() {
      if (!activeLocation) {
        setDashboardPasses([]);
        setNextVisiblePass(null);
        setPassesLoading(false);
        return;
      }

      try {
        setPassesLoading(true);

        const satelliteNames = [
          "ISS",
          "POISK",
          "FREGAT DEB",
        ];

        const results = await Promise.allSettled(
          satelliteNames.map(async (satelliteName) => {
            const response =
              await getSatellitePasses(
                satelliteName,
                {
                  lat: activeLocation.latitude,
                  lon: activeLocation.longitude,
                  min_elevation: 10,
                  hours: 24,
                  sort_by: "time",
                  limit: 1,
                }
              );

            if (response.passes.length === 0) {
              return null;
            }

            return {
              name: response.name,
              pass: response.passes[0],
            };
          })
        );

        if (!active) {
          return;
        }

        const passes = results
          .filter(
            (
              result
            ): result is PromiseFulfilledResult<{
              name: string;
              pass: SatellitePass;
            } | null> =>
              result.status === "fulfilled"
          )
          .map((result) => result.value)
          .filter(
            (
              result
            ): result is {
              name: string;
              pass: SatellitePass;
            } => result !== null
          );

        const sortedPasses = [...passes].sort(
          (a, b) =>
            new Date(a.pass.rise_time).getTime() -
            new Date(b.pass.rise_time).getTime()
        );

        setDashboardPasses(sortedPasses);

        setNextVisiblePass(
          sortedPasses.length > 0
            ? sortedPasses[0].pass
            : null
        );
      } finally {
        if (active) {
          setPassesLoading(false);
        }
      }
    }

    void loadDashboardPasses();

    return () => {
      active = false;
    };
  }, [
    activeLocation,
    selectedSatellite?.name,
  ]);

  async function handleSatelliteSelect(
    satelliteName: string
  ) {
    setSearchQuery("");
    setSearchResults([]);
    setLoading(true);

    try {
      const satellite = await getSatellite(
        satelliteName
      );

      const orbitData = await getSatelliteOrbit(
        satelliteName
      );

      setSelectedSatellite(satellite);
      setOrbit(orbitData.positions);
      setError("");
      setLoading(false);
    } catch {
      setError(
        `Unable to load ${satelliteName} data.`
      );
      setLoading(false);
    }
  }

  function getMinutesUntil(
    riseTime: string
  ): string {
    const difference =
      new Date(riseTime).getTime() -
      Date.now();

    const minutes = Math.max(
      0,
      Math.round(difference / 60000)
    );

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return remainingMinutes === 0
      ? `${hours} hr`
      : `${hours} hr ${remainingMinutes} min`;
  }

  function getSatelliteLabel(
    name: string
  ): string {
    if (name.toUpperCase().includes("ISS")) {
      return "International Space Station";
    }

    return name;
  }

  return (
    <div className="app-shell">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-orbit">
            ◉
          </div>

          <div>
            <div className="brand-name">OrbitScope</div>
            <div className="brand-subtitle">
              SPACE INTELLIGENCE
            </div>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-title">EXPLORE</div>

          <button className="nav-item active">
            <Globe2 size={15} />
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/satellites")}
          >
            <Satellite size={15} />
            Satellites
          </button>

          <button 
            className="nav-item"
            onClick={() => navigate("/favorites")} 
          >
            <Heart size={15} />
            Favorites
          </button>
        </div>

        <div className="nav-section">
          <div className="nav-title">TOOLS</div>

          <button
            className="nav-item"
            onClick={() => navigate("/locations")}
          >
            <MapPin size={15} />
            Locations
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/night-planner")}
          >
            <Moon size={15} />
            Night Planner
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/pass-alerts")}
          >
            <Bell size={15} />
            Pass Alerts
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/tracking")}
          >
            <Activity size={15} />
            Multi Tracking
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/best-satellite")}
          >
            <Star size={15} />
            Best Satellite
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/historical-tracking")}
          >
            <Clock3 size={15} />
            Historical Tracking
          </button>

          <button
            className="nav-item"
            onClick={() => navigate("/satellite-comparison")}
          >
            <GitCompare size={15} />
            Satellite Comparison
          </button>
          
        </div>

        <div className="system-status">
          <div className="status-dot" />
          <div>
            <strong>Systems Online</strong>
            <span>Satellite data synchronized</span>
          </div>
        </div>

      </aside>


      {/* Main */}
      <main className="main-content">

        {/* Header */}
        <header className="topbar">

          <div>
            <div className="eyebrow">
              LIVE ORBITAL INTELLIGENCE
            </div>

            <h1>Good evening, Explorer.</h1>
          </div>

          <div className="topbar-actions">

            <div className="search-container">
              <div className="search-box">
                <Search size={14} />

                <input
                  type="text"
                  placeholder="Search satellites..."
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                />

                <kbd>⌘ K</kbd>
              </div>

              {(searchQuery.trim().length >= 2 ||
                searching) && (
                <div className="search-results">
                  {searching && (
                    <div className="search-result-message">
                      Searching orbital catalog...
                    </div>
                  )}

                  {!searching &&
                    searchResults.length === 0 && (
                      <div className="search-result-message">
                        No satellites found.
                      </div>
                    )}

                  {!searching &&
                    searchResults.map((satelliteName) => (
                      <button
                        key={satelliteName}
                        className="search-result"
                        onClick={() =>
                          handleSatelliteSelect(
                            satelliteName
                          )
                        }
                      >
                        <Satellite size={15} />

                        <span>
                          {satelliteName}
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>

            <button className="icon-button">
              ◔
            </button>

            <button className="profile-button">
              M
            </button>

          </div>

        </header>


        {/* Globe */}
        <section className="globe-panel">

          <div className="panel-header">

            <div>
              <div className="eyebrow">
                ORBITAL VIEW
              </div>

              <h2>Earth in real time</h2>
            </div>

            <div className="live-badge">
              <span />
              LIVE •{" "}
              {selectedSatellite?.name ?? "SATELLITE"}
            </div>

          </div>

          {loading && (
            <div className="globe-data-status">
              Synchronizing orbital data...
            </div>
          )}

          {error && (
            <div className="globe-data-status">
              {error}
            </div>
          )}

          <OrbitGlobe
            satellite={selectedSatellite}
            orbit={orbit}
          />

          <div className="satellite-count">
            <span>CATALOG</span>

            <strong>
              {statsLoading
                ? "—"
                : satelliteCount}
            </strong>

            <small>satellites available</small>
          </div>

          {selectedSatellite && (
            <div className="iss-position">
              <strong>
                {selectedSatellite.name}
              </strong>

              <span>
                {selectedSatellite.latitude?.toFixed(2) ?? "—"}°
                {" "}
                {selectedSatellite.longitude?.toFixed(2) ?? "—"}°
              </span>

              <small>
                Altitude{" "}
                {selectedSatellite.altitude?.toFixed(0) ?? "—"} km
              </small>
            </div>
          )}

        </section>


        {/* Statistics */}
        <section className="stats-grid">

          <StatCard
            icon={<Satellite size={16} />}
            label="Tracked Satellites"
            value={
              statsLoading
                ? "—"
                : satelliteCount.toString()
            }
            status="CATALOG"
          />

          <StatCard
            icon={<Activity size={16} />}
            label="Next Visible Pass"
            value={
              !activeLocation
                ? "Set location"
                : passesLoading
                ? "—"
                : nextVisiblePass
                ? getMinutesUntil(
                    nextVisiblePass.rise_time
                  )
                : "No pass"
            }
            status={
              nextVisiblePass && selectedSatellite
                ? selectedSatellite.name
                : activeLocation
                ? "NEXT PASS"
                : "LOCATION REQUIRED"
            }
          />

          <StatCard
            icon={<MapPin size={16} />}
            label="Your Location"
            value={
              activeLocation?.name ?? "Not set"
            }
            status={
              activeLocation
                ? "ACTIVE"
                : "SET LOCATION"
            }
            onClick={() => navigate("/locations")}
          />

          <StatCard
            icon={<Heart size={16} />}
            label="Favorites"
            value={
              statsLoading
                ? "—"
                : favoriteCount.toString()
            }
            status="VIEW"
            onClick={() => navigate("/favorites")}
          />

        </section>

        {/* Bottom */}
        <section className="bottom-grid">

          <div className="panel">

            <div className="panel-header">
              <div>
                <div className="eyebrow">UPCOMING</div>
                <h2>Next satellite passes</h2>
              </div>

              <button
                className="view-all"
                onClick={() =>
                  navigate(
                    `/satellites/${encodeURIComponent(
                      selectedSatellite?.name ?? "ISS"
                    )}/passes`
                  )
                }
              >
                View all →
              </button>

            </div>

            <div className="pass-list">

              {!activeLocation ? (
                <div className="dashboard-pass-empty">
                  Set an observer location to calculate
                  upcoming satellite passes.
                </div>
              ) : passesLoading ? (
                <div className="dashboard-pass-empty">
                  Calculating upcoming passes...
                </div>
              ) : dashboardPasses.length === 0 ? (
                <div className="dashboard-pass-empty">
                  No upcoming visible passes found.
                </div>
              ) : (
                dashboardPasses.map(
                  ({ name, pass }) => (
                    <div
                      className="pass-row"
                      key={name}
                    >
                      <div className="satellite-symbol">
                        {name
                          .replace(/\s*\(.*?\)/g, "")
                          .slice(0, 5)}
                      </div>

                      <div className="pass-info">
                        <strong>
                          {getSatelliteLabel(name)}
                        </strong>

                        <span>
                          {name}
                        </span>
                      </div>

                      <div className="pass-time">
                        <strong>
                          {getMinutesUntil(
                            pass.rise_time
                          )}
                        </strong>

                        <span>
                          Visible for{" "}
                          {Math.round(
                            pass.duration_minutes
                          )} min
                        </span>
                      </div>
                    </div>
                  )
                )
              )}

            </div>

          </div>


          <div className="panel">

            <div className="panel-header">
              <div>
                <div className="eyebrow">SYSTEM</div>
                <h2>OrbitScope status</h2>
              </div>
            </div>

            <div className="system-list">

              <div>
                <span className="status-circle" />
                <div>
                  <strong>TLE data synchronized</strong>
                  <small>Just now</small>
                </div>
              </div>

              <div>
                <span className="status-circle" />
                <div>
                  <strong>Orbital calculations ready</strong>
                  <small>2 minutes ago</small>
                </div>
              </div>

              <div>
                <span className="status-circle" />
                <div>
                  <strong>Pass prediction engine active</strong>
                  <small>Running continuously</small>
                </div>
              </div>

            </div>

          </div>

        </section>

      </main>
    </div>
  );
}