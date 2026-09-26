import api from "./api";

export interface SatelliteComparison {
  name: string;
  norad_id: number;
  inclination: number;
  eccentricity: number;
  mean_motion: number;
  orbital_period: number;
  epoch: string;
}

export interface SatelliteComparisonResponse {
  satellites: SatelliteComparison[];
}

export async function compareSatellites(
  satelliteNames: string[]
): Promise<SatelliteComparisonResponse> {
  const params = new URLSearchParams();

  satelliteNames.forEach((name) => {
    params.append("satellite_names", name);
  });

  const response =
    await api.get<SatelliteComparisonResponse>(
      "/satellites/compare",
      {
        params,
      }
    );

  return response.data;
}