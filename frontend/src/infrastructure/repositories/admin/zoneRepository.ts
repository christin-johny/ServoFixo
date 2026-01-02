import api from "../../api/axiosClient";
import { ADMIN_ZONE_ENDPOINTS } from "../../api/endpoints/Admin/admin.endpoints";

import type {
  Zone,
  CreateZoneDTO,
  UpdateZoneDTO,
} from "../../../domain/types/Zone";

export interface ZoneQueryParams {
  page: number;
  limit: number;
  search: string;
  isActive?: string;
}

export interface PaginatedResponse {
  zones: Zone[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export const getZones = async (
  params: ZoneQueryParams
): Promise<PaginatedResponse> => {
  const response = await api.get(
    ADMIN_ZONE_ENDPOINTS.ZONES,
    { params }
  );
  return response.data;
};

export const createZone = async (
  data: CreateZoneDTO
): Promise<Zone> => {
  const response = await api.post(
    ADMIN_ZONE_ENDPOINTS.ZONES,
    data
  );
  return response.data.zone;
};

export const updateZone = async (
  data: UpdateZoneDTO
): Promise<Zone> => {
  const response = await api.put(
    ADMIN_ZONE_ENDPOINTS.ZONE_BY_ID(data.id),
    data
  );
  return response.data.zone;
};

export const deleteZone = async (
  id: string
): Promise<void> => {
  await api.delete(
    ADMIN_ZONE_ENDPOINTS.ZONE_BY_ID(id)
  );
};
