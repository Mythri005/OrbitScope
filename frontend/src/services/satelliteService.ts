import api from "./api";
import type { Satellite } from "../types/satellite";

export interface SatelliteSearchResponse {
  count: number;
  satellites: string[];
}

export interface SatelliteListResponse {
  count: number;
  satellites: string[];
}

export async function getSatellite(
  satelliteName: string
): Promise<Satellite> {
  const response = await api.get<Satellite>(
    `/satellite/${encodeURIComponent(satelliteName)}`
  );

  return response.data;
}

export async function searchSatellites(
  name: string
): Promise<SatelliteSearchResponse> {
  const response = await api.get<SatelliteSearchResponse>(
    "/satellites/search",
    {
      params: {
        name,
      },
    }
  );

  return response.data;
}

export async function getSatellites(): Promise<SatelliteListResponse> {
  const response = await api.get<SatelliteListResponse>(
    "/satellites"
  );

  return response.data;
}