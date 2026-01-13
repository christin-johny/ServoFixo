import { Technician } from "../entities/Technician";
import { IBaseRepository } from "./IBaseRepository";
import { 
  ServiceRequest, 
  ZoneRequest,
  TechnicianUpdatePayload,
  BankUpdateRequest,
  PayoutStatus
} from "../../../../shared/types/value-objects/TechnicianTypes";

export interface TechnicianFilterParams {
  search?: string;
  status?: "PENDING" | "VERIFICATION_PENDING" | "VERIFIED" | "REJECTED";
  zoneId?: string;
  categoryId?: string;
  isOnline?: boolean;
}
 
export interface PaginatedTechnicianResult {
  data: Technician[];
  total: number;
  page: number;
  limit: number;
}
export type QueueType = "ONBOARDING" | "MAINTENANCE";

export interface VerificationQueueFilters {
  page: number;
  limit: number;
  search?: string;
  sort?: "asc" | "desc";
  sortBy?: string;
  type?: QueueType;
}

export interface ITechnicianRepository extends IBaseRepository<Technician> {
  findByEmail(email: string): Promise<Technician | null>;
  findByPhone(phone: string): Promise<Technician | null>;

  findAllPaginated(
    page: number,
    limit: number,
    filters: TechnicianFilterParams
  ): Promise<PaginatedTechnicianResult>;

  findAvailableInZone(
    zoneId: string,
    subServiceId: string,
    limit?: number
  ): Promise<Technician[]>;

  findPendingVerification(
    filters: VerificationQueueFilters
  ): Promise<{ technicians: Technician[]; total: number }>;

  updateTechnician(id: string, payload: TechnicianUpdatePayload): Promise<void>;
  toggleBlockTechnician(id: string, isSuspended: boolean, reason?: string): Promise<void>;

  updateOnlineStatus(
    id: string, 
    isOnline: boolean, 
    location?: { lat: number; lng: number }
  ): Promise<void>;

  verifyZoneAccess(
    zoneIds: string[], 
    lat: number, 
    lng: number
  ): Promise<boolean>;

  addServiceRequest(id: string, request: ServiceRequest): Promise<void>;
  addZoneRequest(id: string, request: ZoneRequest): Promise<void>;
  addBankUpdateRequest(id: string, request: BankUpdateRequest): Promise<void>;
  updatePayoutStatus(id: string, status: PayoutStatus): Promise<void>;
}

export { TechnicianUpdatePayload };
