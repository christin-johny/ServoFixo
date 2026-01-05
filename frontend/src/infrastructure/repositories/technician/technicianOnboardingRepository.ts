import api from "../../api/axiosClient";
import axios from 'axios'
import { TECHNICIAN_PROFILE_ENDPOINTS } from "../../api/endpoints/Technician/technician.endpoints";

// --- DTO Interfaces (Mirroring Backend DTOs) ---
export interface Step1Data {
  avatarUrl?: string;
  bio: string;
  experienceSummary: string;
}

export interface Step2Data {
  categoryIds: string[];
  subServiceIds: string[];
}

export interface Step3Data {
  zoneIds: string[];
}

export interface Step4Data {
  agreedToRates: boolean;
}

export interface DocumentMeta {
  type: "AADHAAR" | "PAN" | "DRIVING_LICENSE" | "CERTIFICATE" | "OTHER";
  fileUrl: string;
  fileName: string;
}

export interface Step5Data {
  documents: DocumentMeta[];
}

export interface Step6Data {
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}
export interface CategoryOption {
  iconUrl: string | undefined;
  id: string; // MongoDB ID
  name: string;
}

export interface ServiceOption {
  id: string;
  name: string;
  categoryId: string;
}
export interface ZoneOption {
  id: string;
  name: string;
  isActive: boolean;
  boundaries: { lat: number; lng: number }[];
}
export interface RateCardItem {
  serviceId: string;
  name: string;
  basePrice: number;
  platformFee: number;
  technicianShare: number;
  commissionPercentage: number;
}
export interface IfscResponse {
  BANK: string;
  BRANCH: string;
  CITY: string;
  STATE: string;
}

export const technicianOnboardingRepository = {
  // --- Step Updates ---
  updateStep1: async (data: Step1Data) => {
    const res = await api.patch(
      TECHNICIAN_PROFILE_ENDPOINTS.STEP_1_PERSONAL,
      data
    );
    return res.data;
  },

  updateStep2: async (data: Step2Data) => {
    const res = await api.patch(
      TECHNICIAN_PROFILE_ENDPOINTS.STEP_2_PREFERENCES,
      data
    );
    return res.data;
  }, 

  updateStep3: async (data: { zoneIds: string[] }) => {
    const res = await api.patch(
      TECHNICIAN_PROFILE_ENDPOINTS.STEP_3_ZONES,
      data
    );
    return res.data;
  },

updateStep4: async (data: { agreedToRates: boolean }) => {
    const res = await api.patch(TECHNICIAN_PROFILE_ENDPOINTS.STEP_4_RATES, data);
    return res.data;
  },

  updateStep5: async (data: Step5Data) => {
    const res = await api.patch(
      TECHNICIAN_PROFILE_ENDPOINTS.STEP_5_DOCUMENTS,
      data
    );
    return res.data;
  },

  updateStep6: async (data: Step6Data) => {
    const res = await api.patch(TECHNICIAN_PROFILE_ENDPOINTS.STEP_6_BANK, data);
    return res.data;
  },

  // --- File Upload Helpers ---

  // 1. Avatar Upload (Returns { url: string })
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file); // Must match 'uploadAvatarMiddleware.single("file")'

    const res = await api.post(
      TECHNICIAN_PROFILE_ENDPOINTS.UPLOAD_AVATAR,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data; // Expected: { message: "...", url: "..." }
  },

  // 2. Document Upload (Returns { url: string })
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post(
      TECHNICIAN_PROFILE_ENDPOINTS.UPLOAD_DOCUMENT,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  },

  getCategories: async (): Promise<CategoryOption[]> => {
    const res = await api.get(TECHNICIAN_PROFILE_ENDPOINTS.GET_CATEGORIES);
    return res.data.data;
  },

  getServicesByCategory: async (
    categoryId: string
  ): Promise<ServiceOption[]> => {
    const res = await api.get(TECHNICIAN_PROFILE_ENDPOINTS.GET_SERVICES, {
      params: { categoryId },
    });
    return res.data.data;
  },

  // ✅ NEW Zone Fetcher
  getZones: async (): Promise<ZoneOption[]> => {
    const res = await api.get(TECHNICIAN_PROFILE_ENDPOINTS.GET_ZONES);
    return res.data.data;
  },
  getRateCard: async (): Promise<RateCardItem[]> => {
    // Matches the route: router.get("/rate-card", ...)
    const res = await api.get(TECHNICIAN_PROFILE_ENDPOINTS.GET_RATE_CARD);
    return res.data.data;
  },
  fetchBankDetailsByIfsc: async (ifscCode: string): Promise<IfscResponse> => {
    // We use a direct axios call because this is an external public URL, 
    // not our internal backend API.
    const res = await axios.get(`https://ifsc.razorpay.com/${ifscCode}`);
    return res.data;
  },
};
