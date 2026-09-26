import api from "./api";

export interface SatelliteDetails {
  name: string;
  norad_id: number;
  inclination: number;
  eccentricity: number;
  mean_motion: number;
  orbital_period: number;
  epoch: string;
}

export interface OrbitAnalytics {
  name: string;
  duration_minutes: number;
  point_count: number;
  min_altitude: number;
  max_altitude: number;
  average_altitude: number;
  min_latitude: number;
  max_latitude: number;
  min_longitude: number;
  max_longitude: number;
  estimated_orbital_period_minutes: number;
}

export async function getSatelliteDetails(
  satelliteName: string
): Promise<SatelliteDetails> {
  const response =
    await api.get<SatelliteDetails>(
      `/satellites/${encodeURIComponent(
        satelliteName
      )}/details`
    );

  return response.data;
}

export async function getOrbitAnalytics(
  satelliteName: string,
  duration: number = 90,
  interval: number = 5
): Promise<OrbitAnalytics> {
  const response =
    await api.get<OrbitAnalytics>(
      `/satellites/${encodeURIComponent(
        satelliteName
      )}/analytics`,
      {
        params: {
          duration,
          interval,
        },
      }
    );

  return response.data;
}