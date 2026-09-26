import api from "./api";

export interface PassAlert {
  id: number;
  satellite_name: string;
  location_id: number;
  min_elevation: number;
  enabled: boolean;
  created_at: string;
}

export interface PassAlertCreate {
  satellite_name: string;
  location_id: number;
  min_elevation?: number;
}

export async function getPassAlerts(): Promise<PassAlert[]> {
  const response = await api.get<PassAlert[]>("/alerts");

  return response.data;
}

export async function createPassAlert(
  data: PassAlertCreate
): Promise<PassAlert> {
  const response = await api.post<PassAlert>(
    "/alerts",
    {
      satellite_name: data.satellite_name,
      location_id: data.location_id,
      min_elevation: data.min_elevation ?? 0,
    }
  );

  return response.data;
}

export async function updatePassAlert(
  alertId: number,
  enabled: boolean
): Promise<PassAlert> {
  const response = await api.patch<PassAlert>(
    `/alerts/${alertId}`,
    null,
    {
      params: {
        enabled,
      },
    }
  );

  return response.data;
}

export async function deletePassAlert(
  alertId: number
): Promise<void> {
  await api.delete(`/alerts/${alertId}`);
}