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
} from "lucide-react";

import { NavLink, Outlet } from "react-router-dom";

export default function AppLayout() {
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
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <Activity size={15} />
            Multi Tracking
          </NavLink>

          <NavLink
            to="/best-satellite"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <Star size={15} />
            Best Satellite
          </NavLink>

          <NavLink
            to="/historical-tracking"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <Clock3 size={15} />
            Historical Tracking
          </NavLink>

          <NavLink
            to="/satellite-comparison"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
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


      {/* Page content */}
      <main className="main-content">
        <Outlet />
      </main>

    </div>
  );
}