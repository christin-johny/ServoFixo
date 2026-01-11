import api from "../../api/axiosClient";
import { TECHNICIAN_PROFILE_ENDPOINTS } from "../../api/endpoints/Technician/technician.endpoints";
import { type VerificationStatus } from "../../../store/technicianSlice"; // Import from your slice or shared types

export interface TechnicianProfileStatusDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  bio?: string;
  experienceSummary?: string;

  onboardingStep: number;
  verificationStatus: VerificationStatus;
  
  globalRejectionReason?: string; // Corresponds to backend's globalRejectionReason
  verificationReason?: string; // Corresponds to backend's verificationReason (legacy)

  availability: {
    isOnline: boolean;
  };

  // ✅ ADDED Missing Fields
  categoryIds: string[];
  subServiceIds: string[];
  zoneIds: string[];

  // Optional Hydrated Fields (for Dashboard)
  categories?: { id: string; name: string; iconUrl?: string }[];
  subServices?: { id: string; name: string; categoryId: string }[];
  serviceZones?: { id: string; name: string }[];

  documents: {
    type: string;
    fileUrl: string;
    fileName: string;
    status?: "PENDING" | "APPROVED" | "REJECTED";
    rejectionReason?: string;
  }[];

  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };

  createdAt: string; // ✅ Added
}

export interface ToggleStatusPayload {
  lat?: number;
  lng?: number;
  isOnline?: boolean;
}

export const getTechnicianProfileStatus = async (): Promise<TechnicianProfileStatusDto> => {
  const response = await api.get(TECHNICIAN_PROFILE_ENDPOINTS.GET_STATUS);
  return response.data as TechnicianProfileStatusDto;
};

export const toggleOnlineStatus = async (payload: ToggleStatusPayload) => {
  const response = await api.patch("/technician/profile/status", payload);
  return response.data; 
};