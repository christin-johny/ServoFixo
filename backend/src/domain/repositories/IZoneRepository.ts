import { Zone } from "../entities/Zone";
import { IBaseRepository } from "./IBaseRepository";

export interface ZoneQueryParams {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
}

export interface PaginatedZones {
  zones: Zone[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export interface IZoneRepository extends IBaseRepository<Zone> {
  // create(zone: Zone): Promise<Zone>;
  // findById(id: string): Promise<Zone | null>;
  // update(zone: Zone): Promise<Zone>;
  // delete(id: string): Promise<boolean>;
  
  findAll(params: ZoneQueryParams): Promise<PaginatedZones>;
  findByName(name: string): Promise<Zone | null>;
  findZoneByCoordinates(lat: number, lng: number): Promise<Zone | null>;
}
