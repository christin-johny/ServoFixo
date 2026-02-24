import {  
  TechnicianFilterParams, 
  VerificationQueueFilters 
} from "../../../../domain/repositories/ITechnicianRepository";
import { PaginatedTechnicianQueueResponse } from "../../../dto/technician/TechnicianQueueDto";
import { ResolvePartnerRequestDto } from "../../../dto/admin/ManageRequestDto";
import { VerifyTechnicianDto } from "../../../dto/technician/TechnicianVerificationDtos";
import { UpdateTechnicianDto } from "../../../dto/technician/UpdateTechnicianDto";

/**
 * TECHNICIAN MANAGEMENT CONTRACTS
 * Defines the administrative boundary for verifying partners and resolving requests.
 */

export interface IGetAllTechniciansUseCase {
  execute(params: TechnicianFilterParams & { page: number; limit: number }): Promise<PaginatedTechnicianQueueResponse>;
}

export interface IGetVerificationQueueUseCase {
  execute(params: VerificationQueueFilters): Promise<PaginatedTechnicianQueueResponse>;
}

export interface IVerifyTechnicianUseCase {
  execute(id: string, dto: VerifyTechnicianDto): Promise<void>;
}

export interface IResolveBankRequestUseCase {
  execute(techId: string, dto: ResolvePartnerRequestDto): Promise<void>;
}

export interface IResolveServiceRequestUseCase {
  execute(techId: string, dto: ResolvePartnerRequestDto): Promise<void>;
}

export interface IResolveZoneRequestUseCase {
  execute(techId: string, dto: ResolvePartnerRequestDto): Promise<void>;
}

export interface IDismissTechnicianRequestUseCase {
  execute(technicianId: string, requestId: string): Promise<void>;
}

export interface IUpdateTechnicianUseCase {
  execute(id: string, updates: UpdateTechnicianDto): Promise<void>;
}

export interface IBlockTechnicianUseCase {
  execute(id: string, isSuspended: boolean, reason?: string): Promise<void>;
}

export interface IDeleteTechnicianUseCase {
  execute(id: string): Promise<void>;
}

export interface IManageTechnicianUseCase { 
  toggleBlock(id: string, isSuspended: boolean, reason?: string): Promise<void>;
  delete(id: string): Promise<void>;
}