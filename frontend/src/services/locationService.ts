import api from "./api";

export interface ObserverLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface CreateLocationPayload {
  name: string;
  latitude: number;
  longitude: number;
}

export async function getLocations(): Promise<ObserverLocation[]> {
  const response = await api.get<ObserverLocation[]>("/locations");
  return response.data;
}

export async function createLocation(
  payload: CreateLocationPayload
): Promise<ObserverLocation> {
  const response = await api.post<ObserverLocation>(
    "/locations",
    payload
  );

  return response.data;
}

export async function deleteLocation(
  locationId: number
): Promise<void> {
  await api.delete(`/locations/${locationId}`);
}