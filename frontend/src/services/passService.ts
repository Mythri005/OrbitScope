import api from "./api";

export interface SatellitePass {
  rise_time: string;
  culmination_time: string;
  set_time: string;
  max_elevation: number;
  duration_minutes: number;
  visibility: string;
  quality: string;
  is_sunlit: boolean;
  is_observer_in_darkness: boolean;
  recommendation: string;
}

export interface PassPredictionResponse {
  name: string;
  passes: SatellitePass[];
  best_pass_index: number;
  best_pass: SatellitePass;
}

export interface PassCalendarResponse {
  name: string;
  days: number;
  passes: SatellitePass[];
}

export interface PassPredictionParams {
  lat?: number;
  lon?: number;
  min_elevation?: number;
  hours?: number;
  sort_by?: "time" | "elevation";
  limit?: number;
}

export interface PassCalendarParams {
  lat?: number;
  lon?: number;
  days?: number;
  min_elevation?: number;
}

export async function getSatellitePasses(
  satelliteName: string,
  params: PassPredictionParams = {}
): Promise<PassPredictionResponse> {
  const response =
    await api.get<PassPredictionResponse>(
      `/satellites/${encodeURIComponent(
        satelliteName
      )}/pass`,
      {
        params,
      }
    );

  return response.data;
}

export async function getPassCalendar(
  satelliteName: string,
  params: PassCalendarParams = {}
): Promise<PassCalendarResponse> {
  const response =
    await api.get<PassCalendarResponse>(
      `/satellites/${encodeURIComponent(
        satelliteName
      )}/passes/calendar`,
      {
        params,
      }
    );

  return response.data;
}