import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Satellites from "./pages/Satellites";
import ProtectedRoute from "./components/common/ProtectedRoute";
import SatelliteDetails from "./pages/SatelliteDetails";
import Passes from "./pages/Passes";
import PassCalendar from "./pages/PassCalendar";
import Locations from "./pages/Locations";
import { ObserverLocationProvider } from "./context/ObserverLocationContext";
import NightPlanner from "./pages/NightPlanner";
import Favorites from "./pages/Favorites";
import AppLayout from "./components/layout/AppLayout";
import PassAlerts from "./pages/PassAlerts";
import Tracking from "./pages/Tracking";
import BestSatellite from "./pages/BestSatellite";
import HistoricalTracking from "./pages/HistoricalTracking";
import SatelliteComparison from "./pages/SatelliteComparison";

function App() {
  return (
    <BrowserRouter>
      <ObserverLocationProvider>

        <Routes>

          {/* Public routes */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />


          {/* Protected routes */}

          <Route element={<ProtectedRoute />}>

            {/* Dashboard */}
            <Route
              path="/"
              element={<Dashboard />}
            />


            {/* Shared OrbitScope layout */}

            <Route element={<AppLayout />}>

              <Route
                path="/satellites"
                element={<Satellites />}
              />

              <Route
                path="/satellites/:satelliteName"
                element={<SatelliteDetails />}
              />

              <Route
                path="/satellites/:satelliteName/passes"
                element={<Passes />}
              />

              <Route
                path="/satellites/:satelliteName/passes/calendar"
                element={<PassCalendar />}
              />

              <Route
                path="/locations"
                element={<Locations />}
              />

              <Route
                path="/night-planner"
                element={<NightPlanner />}
              />

              <Route
                path="/favorites"
                element={<Favorites />}
              />

              <Route
                path="/pass-alerts"
                element={<PassAlerts />}
              />

              <Route 
                path="/tracking" 
                element={<Tracking />} 
              />

              <Route
                path="/best-satellite"
                element={<BestSatellite />}
              />

              <Route
                path="/historical-tracking"
                element={<HistoricalTracking />}
              />

              <Route
                path="/satellite-comparison"
                element={<SatelliteComparison />}
              />

            </Route>

          </Route>

        </Routes>

      </ObserverLocationProvider>
    </BrowserRouter>
  );
}

export default App;