import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getLocations,
  type ObserverLocation,
} from "../services/locationService";

interface ObserverLocationContextValue {
  locations: ObserverLocation[];
  activeLocation: ObserverLocation | null;
  loading: boolean;
  setActiveLocation: (location: ObserverLocation) => void;
  clearActiveLocation: () => void;
  refreshLocations: () => Promise<void>;
}

const ObserverLocationContext =
  createContext<ObserverLocationContextValue | undefined>(
    undefined
  );

const ACTIVE_LOCATION_KEY = "active_observer_location_id";

export function ObserverLocationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [locations, setLocations] = useState<ObserverLocation[]>([]);
  const [activeLocation, setActiveLocationState] =
    useState<ObserverLocation | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshLocations() {
    try {
      setLoading(true);

      const response = await getLocations();
      setLocations(response);

      const savedId = localStorage.getItem(ACTIVE_LOCATION_KEY);

      if (savedId) {
        const savedLocation = response.find(
          (location) => String(location.id) === savedId
        );

        if (savedLocation) {
          setActiveLocationState(savedLocation);
          return;
        }
      }

      if (response.length > 0) {
        setActiveLocationState(response[0]);
        localStorage.setItem(
          ACTIVE_LOCATION_KEY,
          String(response[0].id)
        );
      } else {
        setActiveLocationState(null);
        localStorage.removeItem(ACTIVE_LOCATION_KEY);
      }
    } finally {
      setLoading(false);
    }
  }

  function setActiveLocation(location: ObserverLocation) {
    setActiveLocationState(location);
    localStorage.setItem(
      ACTIVE_LOCATION_KEY,
      String(location.id)
    );
  }

  function clearActiveLocation() {
    setActiveLocationState(null);
    localStorage.removeItem(ACTIVE_LOCATION_KEY);
  }

  useEffect(() => {
    void refreshLocations();
  }, []);

  const value = useMemo(
    () => ({
      locations,
      activeLocation,
      loading,
      setActiveLocation,
      clearActiveLocation,
      refreshLocations,
    }),
    [locations, activeLocation, loading]
  );

  return (
    <ObserverLocationContext.Provider value={value}>
      {children}
    </ObserverLocationContext.Provider>
  );
}

export function useObserverLocation() {
  const context = useContext(ObserverLocationContext);

  if (!context) {
    throw new Error(
      "useObserverLocation must be used inside ObserverLocationProvider"
    );
  }

  return context;
}