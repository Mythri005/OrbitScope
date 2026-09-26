import api from "./api";

export interface BestSatellitePassDetails {
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

export interface BestSatelliteResponse {
  satellite_name: string;
  pass_details: BestSatellitePassDetails;
  score: number;
  reason: string;
}

export async function getBestSatellite(
  satelliteNames: string[],
  lat: number,
  lon: number,
  hours: number = 24,
  minElevation: number = 0
): Promise<BestSatelliteResponse> {
  const params = new URLSearchParams();

  satelliteNames.forEach((name) => {
    params.append("satellite_names", name);
  });

  params.append("lat", String(lat));
  params.append("lon", String(lon));
  params.append("hours", String(hours));
  params.append("min_elevation", String(minElevation));

  const response = await api.get<BestSatelliteResponse>(
    "/satellites/best",
    {
      params,
    }
  );

  return response.data;
}