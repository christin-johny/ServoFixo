import api from "../../api/axiosClient";
import { TECHNICIAN_PROFILE_ENDPOINTS } from "../../api/endpoints/Technician/technician.endpoints";

// 1. Define Strict DTO
export interface TechnicianProfileStatusDto {
  id: string;
  onboardingStep: number;
  verificationStatus: "PENDING"  | "VERIFICATION_PENDING"|"VERIFIED" | "REJECTED";
  availability: {
    isOnline: boolean;
  };
  personalDetails: {
    name: string;
    email: string;
    phone: string;
    avatarUrl?: string;
    bio?: string;
    experienceSummary?: string;
  };
}

// 2. Repository Function
export const getTechnicianProfileStatus = async (): Promise<TechnicianProfileStatusDto> => {
  // ✅ FIX: Removed <TechnicianProfileStatusDto> from .get()
  // Instead, we let axios return 'any' and cast the .data property
  const response = await api.get(TECHNICIAN_PROFILE_ENDPOINTS.GET_STATUS);
  
  // ✅ Explicitly cast the data to your DTO
  return response.data as TechnicianProfileStatusDto;
};