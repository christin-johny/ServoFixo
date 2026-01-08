import api from "../../api/axiosClient";
import { TECHNICIAN_PROFILE_ENDPOINTS } from "../../api/endpoints/Technician/technician.endpoints";

export interface TechnicianProfileStatusDto {
  id: string;
  onboardingStep: number;
  verificationStatus: "PENDING" | "VERIFICATION_PENDING" | "VERIFIED" | "REJECTED";
   
  globalRejectionReason?: string; 

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