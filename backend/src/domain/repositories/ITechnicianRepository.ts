import { Technician } from "../entities/Technician";
import { IBaseRepository } from "./IBaseRepository";

export interface TechnicianFilterParams {
  search?: string;
  status?: "PENDING" | "VERIFIED" | "REJECTED";
  zoneId?: string;
  categoryId?: string;
  isOnline?: boolean;
}

// Consistent with PaginatedResult<T> pattern
export interface PaginatedTechnicianResult {
  data: Technician[];
  total: number;
  page: number;
  limit: number;
}

export interface ITechnicianRepository extends IBaseRepository<Technician> {
  // create(technician: Technician): Promise<Technician>;
  // update(technician: Technician): Promise<Technician>;
  // delete(id: string): Promise<boolean>;
  // findById(id: string): Promise<Technician | null>;

  // Core Lookups
  findByEmail(email: string): Promise<Technician | null>;
  findByPhone(phone: string): Promise<Technician | null>;

  // Listings
  findAllPaginated(
    page: number,
    limit: number,
    filters: TechnicianFilterParams
  ): Promise<PaginatedTechnicianResult>;

  // Specific Geospatial Query (For Job Dispatch)
  findAvailableInZone(
    zoneId: string,
    subServiceId: string,
    limit?: number
  ): Promise<Technician[]>;
}
