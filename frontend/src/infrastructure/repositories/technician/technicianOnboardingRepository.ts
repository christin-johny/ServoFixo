import api from "../../api/axiosClient";
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

export const technicianOnboardingRepository = {
  // --- Step Updates ---
  updateStep1: async (data: Step1Data) => {
    const res = await api.patch(TECHNICIAN_PROFILE_ENDPOINTS.STEP_1_PERSONAL, data);
    return res.data;
  },

  updateStep2: async (data: Step2Data) => {
    const res = await api.patch(TECHNICIAN_PROFILE_ENDPOINTS.STEP_2_PREFERENCES, data);
    return res.data;
  },

  updateStep3: async (data: Step3Data) => {
    const res = await api.patch(TECHNICIAN_PROFILE_ENDPOINTS.STEP_3_ZONES, data);
    return res.data;
  },

  updateStep4: async (data: Step4Data) => {
    const res = await api.patch(TECHNICIAN_PROFILE_ENDPOINTS.STEP_4_RATES, data);
    return res.data;
  },

  updateStep5: async (data: Step5Data) => {
    const res = await api.patch(TECHNICIAN_PROFILE_ENDPOINTS.STEP_5_DOCUMENTS, data);
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

    const res = await api.post(TECHNICIAN_PROFILE_ENDPOINTS.UPLOAD_AVATAR, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data; // Expected: { message: "...", url: "..." }
  },

  // 2. Document Upload (Returns { url: string })
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post(TECHNICIAN_PROFILE_ENDPOINTS.UPLOAD_DOCUMENT, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }
};