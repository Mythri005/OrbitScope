import api from "./api";

export interface NightPlannerResponse {
  location_id: number;
  location_name: string;
  date: string;

  sunrise: string;
  sunset: string;

  civil_twilight_begin: string;
  civil_twilight_end: string;

  nautical_twilight_begin: string;
  nautical_twilight_end: string;

  astronomical_twilight_begin: string;
  astronomical_twilight_end: string;

  darkness_duration_minutes: number;
  is_dark_now: boolean;
}

export async function getNightPlanner(
  locationId: number
): Promise<NightPlannerResponse> {
  const response = await api.get<NightPlannerResponse>(
    `/locations/${locationId}/night`
  );

  return response.data;
}