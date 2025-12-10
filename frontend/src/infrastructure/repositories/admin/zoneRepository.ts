import api from "../../api/axiosClient";
import type { Zone, CreateZoneDTO, UpdateZoneDTO } from "../../../domain/types/Zone";

export interface ZoneQueryParams {
  page: number;
  limit: number;
  search: string;
  isActive?: string;
}

export interface PaginatedResponse {
  data: Zone[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export const getZones = async (params: ZoneQueryParams): Promise<PaginatedResponse> => {
  const response = await api.get("/api/admin/zones", { params });
  return response.data;
};
export const createZone = async (data: CreateZoneDTO): Promise<Zone> => {
  const response = await api.post("/api/admin/zones", data);
  return response.data.zone;
};

// ✅ NEW: Update function
export const updateZone = async (data: UpdateZoneDTO): Promise<Zone> => {
  const response = await api.put(`/api/admin/zones/${data.id}`, data);
  return response.data.zone;
};

export const deleteZone = async (id: string): Promise<void> => {
  await api.delete(`/api/admin/zones/${id}`);
};