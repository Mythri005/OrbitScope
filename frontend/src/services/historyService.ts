import api from "./api";

export interface HistoricalRecord {
  id: number;
  satellite_name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  timestamp: string;
}

export async function recordSatelliteHistory(
  satelliteName: string
): Promise<HistoricalRecord> {
  const response =
    await api.post<HistoricalRecord>(
      `/satellites/${encodeURIComponent(
        satelliteName
      )}/history`
    );

  return response.data;
}

export async function getSatelliteHistory(
  satelliteName: string
): Promise<HistoricalRecord[]> {
  const response =
    await api.get<HistoricalRecord[]>(
      `/satellites/${encodeURIComponent(
        satelliteName
      )}/history`
    );

  return response.data;
}