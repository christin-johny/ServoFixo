import api from "../../api/axiosClient";
import { ADMIN_TECHNICIAN_ENDPOINTS } from "../../api/endpoints/Admin/admin.endpoints";
import type { 
  PaginatedTechnicianQueue, 
  TechnicianProfileFull 
} from "../../../domain/types/Technician";

export interface VerificationQueueParams {
  page: number;
  limit: number;
  search?: string;
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
export interface TechnicianListParams {
  page: number;
  limit: number;
  search?: string;
  status?: string; // "VERIFIED" | "REJECTED" | etc.
}

// --- Phase 1: Get Queue ---
export const getVerificationQueue = async (
  params: VerificationQueueParams
): Promise<PaginatedTechnicianQueue> => {
  const response = await api.get(ADMIN_TECHNICIAN_ENDPOINTS.QUEUE, { params });
  // The backend wraps data in { success: true, data: ... }. 
  // Adjust this based on your exact interceptor. 
  // Assuming standard response.data based on your other repos:
  return response.data.data; 
};
export const getTechnicians = async (
  params: TechnicianListParams
): Promise<PaginatedTechnicianQueue> => {
  const response = await api.get(ADMIN_TECHNICIAN_ENDPOINTS.LIST, { params });
  return response.data.data;
};

// --- Phase 2: Get Full Profile ---
export const getTechnicianProfile = async (
  id: string
): Promise<TechnicianProfileFull> => {
  const response = await api.get(ADMIN_TECHNICIAN_ENDPOINTS.PROFILE(id));
  return response.data.data;
};

// --- Phase 2: Perform Verification ---
export const verifyTechnician = async (
  id: string,
  payload: VerifyActionPayload
): Promise<void> => {
  await api.patch(ADMIN_TECHNICIAN_ENDPOINTS.VERIFY(id), payload);
};