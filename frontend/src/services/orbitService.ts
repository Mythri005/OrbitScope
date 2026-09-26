import api from "./api";

export interface OrbitPoint {
  time: string;
  latitude: number;
  longitude: number;
  altitude: number;
}

export interface OrbitResponse {
  name: string;
  positions: OrbitPoint[];
}

export async function getSatelliteOrbit(
  satelliteName: string,
  duration: number = 90,
  interval: number = 5
): Promise<OrbitResponse> {
  const response = await api.get<OrbitResponse>(
    `/satellites/${encodeURIComponent(satelliteName)}/orbit`,
    {
      params: {
        duration,
        interval,
      },
    }
  );

  return response.data;
}