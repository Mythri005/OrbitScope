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
  Menu,
  X
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

  const { currentUser, logout } = useAuth();

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setProfileOpen(false);
    setMobileMenuOpen(false);
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

          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>

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

      {mobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`mobile-sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-sidebar-header">
          <div className="brand">
            <Satellite size={22} />
            <span>OrbitScope</span>
          </div>

          <button
            className="mobile-menu-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mobile-nav">

          <div className="nav-section-title">EXPLORE</div>

          <NavLink
            to="/"
            end
            onClick={() => setMobileMenuOpen(false)}
          >
            <Globe2 size={18} />
            Dashboard
          </NavLink>

          <NavLink to="/satellites" onClick={() => setMobileMenuOpen(false)}>
            <Satellite size={18} />
            Satellites
          </NavLink>

          <NavLink to="/favorites" onClick={() => setMobileMenuOpen(false)}>
            <Heart size={18} />
            Favorites
          </NavLink>


          <div className="nav-section-title">TOOLS</div>

          <NavLink to="/locations" onClick={() => setMobileMenuOpen(false)}>
            <MapPin size={18} />
            Locations
          </NavLink>

          <NavLink to="/night-planner" onClick={() => setMobileMenuOpen(false)}>
            <Moon size={18} />
            Night Planner
          </NavLink>

          <NavLink to="/pass-alerts" onClick={() => setMobileMenuOpen(false)}>
            <Bell size={18} />
            Pass Alerts
          </NavLink>

          <NavLink to="/tracking" onClick={() => setMobileMenuOpen(false)}>
            <Activity size={18} />
            Multi Tracking
          </NavLink>

          <NavLink to="/best-satellite" onClick={() => setMobileMenuOpen(false)}>
            <Star size={18} />
            Best Satellite
          </NavLink>

          <NavLink to="/historical-tracking" onClick={() => setMobileMenuOpen(false)}>
            <Clock3 size={18} />
            Historical Tracking
          </NavLink>

          <NavLink to="/satellite-comparison" onClick={() => setMobileMenuOpen(false)}>
            <GitCompare size={18} />
            Satellite Comparison
          </NavLink>

        </nav>
      </aside>

    </div>
  );
}