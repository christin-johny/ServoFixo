import { Zone } from "../entities/Zone";

export interface ZoneQueryParams {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
}

export interface PaginatedZones {
  zones: Zone[]; // <--- CHANGED from 'data' to 'zones' to match Use Case
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface IZoneRepository {
  create(zone: Zone): Promise<Zone>;
  findAll(params: ZoneQueryParams): Promise<PaginatedZones>;
  findById(id: string): Promise<Zone | null>;
  findByName(name: string): Promise<Zone | null>;
  update(zone: Zone): Promise<Zone>;
  delete(id: string): Promise<boolean>;
  findZoneByCoordinates(lat: number, lng: number): Promise<Zone | null>;
}