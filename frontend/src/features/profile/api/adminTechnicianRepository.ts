import api from "../../../lib/axiosClient";
import { ADMIN_TECHNICIAN_ENDPOINTS } from "./endpoints";
import type { TechnicianProfileFull } from "../types/Technician";
import type { 
  ResolvePartnerRequestDto 
} from "../types/TechnicianVerificationDtos";
import type { PaginatedTechnicianQueueResponse } from "src/features/profile/types/TechnicianQueueDto";

export interface TechnicianListItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  status: "PENDING" | "VERIFICATION_PENDING" | "VERIFIED" | "REJECTED";
  isSuspended: boolean;
  submittedAt: string;
  experienceSummary?: string;
}

export interface PaginatedTechnicianList {
  data: TechnicianListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TechnicianListParams {
  page: number;
  limit: number;
  search?: string;
  status?: string;
}

export interface VerificationQueueParams {
  page: number;
  limit: number;
  search?: string;
  sort?: "asc" | "desc";
  sortBy?: string;
  type?:"ONBOARDING"| "MAINTENANCE";
}

export interface VerifyActionPayload {
  action: "APPROVE" | "REJECT";
  documentDecisions?: {
    type: string;
    status: "APPROVED" | "REJECTED";
    rejectionReason?: string;
  }[];
  globalRejectionReason?: string;
}

export interface UpdateTechnicianPayload {
  name?: string;
  email?: string;
  phone?: string;
  experienceSummary?: string;
  zoneIds?: string[];
  categoryIds?: string[];
  subServiceIds?: string[];
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  bio: string;
}


export const getVerificationQueue = async (
  params: VerificationQueueParams
): Promise<PaginatedTechnicianQueueResponse> => {  
  const response = await api.get(ADMIN_TECHNICIAN_ENDPOINTS.QUEUE, { params });
  return response.data.data;
};

export const getTechnicians = async (
  params: TechnicianListParams
): Promise<PaginatedTechnicianList> => {
  const response = await api.get(ADMIN_TECHNICIAN_ENDPOINTS.LIST, { params });
  return response.data.data;
};

export const getTechnicianProfile = async (
  id: string
): Promise<TechnicianProfileFull> => {
  const response = await api.get(ADMIN_TECHNICIAN_ENDPOINTS.PROFILE(id));
  return response.data.data;
};

export const verifyTechnician = async (
  id: string,
  payload: VerifyActionPayload
): Promise<void> => {
  await api.patch(ADMIN_TECHNICIAN_ENDPOINTS.VERIFY(id), payload);
};

export const updateTechnician = async (
  id: string,
  data: UpdateTechnicianPayload
): Promise<void> => {
  await api.put(ADMIN_TECHNICIAN_ENDPOINTS.PROFILE(id), data);
};

export const toggleBlockTechnician = async (
  id: string,
  isSuspended: boolean,
  reason?: string
): Promise<void> => {
  await api.patch(ADMIN_TECHNICIAN_ENDPOINTS.BLOCK(id), { isSuspended, reason });
};

export const resolvePartnerRequest = async (
  id: string,
  payload: ResolvePartnerRequestDto
): Promise<void> => {
  await api.patch(ADMIN_TECHNICIAN_ENDPOINTS.RESOLVE_REQUEST(id), payload);
};
