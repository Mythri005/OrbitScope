import api from "./api";

export interface FavoriteSatellite {
  id: number;
  satellite_name: string;
  created_at: string;
}

export async function getFavorites(): Promise<FavoriteSatellite[]> {
  const response = await api.get<FavoriteSatellite[]>(
    "/favorites"
  );

  return response.data;
}

export async function addFavorite(
  satelliteName: string
): Promise<FavoriteSatellite> {
  const response = await api.post<FavoriteSatellite>(
    `/favorites/${encodeURIComponent(satelliteName)}`
  );

  return response.data;
}

export async function removeFavorite(
  satelliteName: string
): Promise<void> {
  await api.delete(
    `/favorites/${encodeURIComponent(satelliteName)}`
  );
}