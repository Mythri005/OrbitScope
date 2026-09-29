import {
  Activity,
  Bell,
  Clock3,
  GitCompare,
  Globe2,
  Heart,
  MapPin,
  Satellite,
  Moon,
  Star,
  LogOut,
} from "lucide-react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useState } from "react";

import { useAuth } from "../../context/AuthContext";

export default function AppLayout() {
  const navigate = useNavigate();

  const { currentUser } = useAuth();

  const [profileOpen, setProfileOpen] =
    useState(false);

  function handleLogout() {
    localStorage.removeItem("access_token");

    setProfileOpen(false);

    navigate("/login");
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
            <div className="brand-name">
              OrbitScope
            </div>

            <div className="brand-subtitle">
              SPACE INTELLIGENCE
            </div>
          </div>
        </div>


        {/* Explore */}
        <div className="nav-section">

          <div className="nav-title">
            EXPLORE
          </div>

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <Globe2 size={15} />
            Dashboard
          </NavLink>

          <NavLink
            to="/satellites"
            end
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <Satellite size={15} />
            Satellites
          </NavLink>

          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <Heart size={15} />
            Favorites
          </NavLink>

        </div>


        {/* Tools */}
        <div className="nav-section">

          <div className="nav-title">
            TOOLS
          </div>

          <NavLink
            to="/locations"
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <MapPin size={15} />
            Locations
          </NavLink>

          <NavLink
            to="/night-planner"
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <Moon size={15} />
            Night Planner
          </NavLink>

          <NavLink
            to="/pass-alerts"
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <Bell size={15} />
            Pass Alerts
          </NavLink>

          <NavLink
            to="/tracking"
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <Activity size={15} />
            Multi Tracking
          </NavLink>

          <NavLink
            to="/best-satellite"
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <Star size={15} />
            Best Satellite
          </NavLink>

          <NavLink
            to="/historical-tracking"
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <Clock3 size={15} />
            Historical Tracking
          </NavLink>

          <NavLink
            to="/satellite-comparison"
            className={({ isActive }) =>
              `nav-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <GitCompare size={15} />
            Satellite Comparison
          </NavLink>

        </div>


        {/* System status */}
        <div className="system-status">

          <div className="status-dot" />

          <div>
            <strong>
              Systems Online
            </strong>

            <span>
              Satellite data synchronized
            </span>
          </div>

        </div>

      </aside>


      {/* Main */}
      <main className="main-content">

        {/* Header */}
        <header className="top-header">

          <div />

          <div className="header-actions">

            <div className="profile-wrapper">

              <button
                className="profile-button"
                onClick={() =>
                  setProfileOpen(
                    (current) => !current
                  )
                }
                aria-label="Open profile menu"
                aria-expanded={profileOpen}
              >
                {currentUser?.name?.charAt(0).toUpperCase() || "M"}
              </button>

              {profileOpen && (
                <div className="profile-menu">

                  <div className="profile-menu-header">
                    <strong>OrbitScope</strong>
                    <span>Signed in</span>
                  </div>

                  <button
                    className="profile-menu-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Log out
                  </button>

                </div>
              )}

            </div>

          </div>

        </header>

        <Outlet />

      </main>

    </div>
  );
}