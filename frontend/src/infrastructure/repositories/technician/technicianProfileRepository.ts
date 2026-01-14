import api from "../../api/axiosClient";
import { TECHNICIAN_PROFILE_ENDPOINTS } from "../../api/endpoints/Technician/technician.endpoints";
import { type VerificationStatus } from "../../../store/technicianSlice";

// ✅ Import Shared Request Types
import type { 
  ServiceRequest, 
  ZoneRequest, 
  BankUpdateRequest
} from "../../../domain/types/TechnicianRequestTypes";
import type {PayoutStatus}  from '../../../../../shared/types/value-objects/TechnicianTypes'
// --- DTOs ---

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
  
  globalRejectionReason?: string;
  verificationReason?: string;

  availability: {
    isOnline: boolean;
    isOnJob: boolean; // ✅ Added this too
  };

  categoryIds: string[];
  subServiceIds: string[];
  zoneIds: string[];

  // ✅ FIXED: Added Missing Request Fields to match TechnicianApiResponse
  serviceRequests: ServiceRequest[];
  zoneRequests: ZoneRequest[];
  bankUpdateRequests: BankUpdateRequest[];
  payoutStatus: PayoutStatus;

  // Hydrated Fields
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
    upiId?: string;
  };

walletBalance?: {
    currentBalance: number;
    frozenAmount: number; // <--- This was missing
    currency: string;
  };

  rating?: {
    average: number;
    count: number;
  };

  createdAt: string;
}

export interface ToggleStatusPayload {
  lat?: number;
  lng?: number;
  isOnline?: boolean;
}

export interface RequestServicePayload {
  serviceId: string;
  categoryId: string;
  proofUrl: string;
  action: "ADD" | "REMOVE";
}

export interface RequestZonePayload {
  currentZoneId: string;
  requestedZoneId: string;
}

export interface RequestBankPayload {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  upiId?: string;
  proofUrl: string;
}

// --- Repository Methods (Named Exports) ---

export const getTechnicianProfileStatus = async (): Promise<TechnicianProfileStatusDto> => {
  const response = await api.get(TECHNICIAN_PROFILE_ENDPOINTS.GET_STATUS);
  return response.data as TechnicianProfileStatusDto;
};

export const toggleOnlineStatus = async (payload: ToggleStatusPayload) => {
  const response = await api.patch("/technician/profile/status", payload);
  return response.data; 
};

export const uploadDocument = async (file: File, folder: "avatars" | "documents"): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const endpoint = folder === "avatars" 
    ? TECHNICIAN_PROFILE_ENDPOINTS.UPLOAD_AVATAR 
    : TECHNICIAN_PROFILE_ENDPOINTS.UPLOAD_DOCUMENT;

  const { data } = await api.post(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  
  return data.url; 
};
 
export const requestServiceAddition = async (payload: RequestServicePayload): Promise<{ success: boolean }> => {
  // Ensure the API call sends the full payload including the action
  const { data } = await api.post(TECHNICIAN_PROFILE_ENDPOINTS.REQUEST_SERVICE, payload);
  return data;
};

export const requestZoneTransfer = async (payload: RequestZonePayload) => {
  const { data } = await api.post(TECHNICIAN_PROFILE_ENDPOINTS.REQUEST_ZONE, payload);
  return data;
};

export const requestBankUpdate = async (payload: RequestBankPayload) => {
  const { data } = await api.post(TECHNICIAN_PROFILE_ENDPOINTS.REQUEST_BANK, payload);
  return data;
};
export const dismissRequestNotification = async (requestId: string): Promise<void> => { 
  await api.patch(TECHNICIAN_PROFILE_ENDPOINTS.DISMISS_REQUEST(requestId));
};