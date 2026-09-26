import api from "./api";
import type { Satellite } from "../types/satellite";

export interface MultiSatelliteTrackingResponse {
  satellites: Satellite[];
}

export async function getMultiSatelliteTracking(
  satelliteNames: string[]
): Promise<MultiSatelliteTrackingResponse> {
  const params = new URLSearchParams();

  satelliteNames.forEach((name) => {
    params.append("satellite_names", name);
  });

  const response = await api.get<MultiSatelliteTrackingResponse>(
    "/satellites/tracking",
    {
      params,
    }
  );

  return response.data;
}