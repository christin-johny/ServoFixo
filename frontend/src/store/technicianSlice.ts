import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type  { 
  ServiceRequest, 
  ZoneRequest, 
  BankUpdateRequest, 
  PayoutStatus 
} from "../domain/types/TechnicianRequestTypes";

export type VerificationStatus =
  | "PENDING"
  | "VERIFICATION_PENDING"
  | "VERIFIED"
  | "REJECTED";
 
export interface CategoryData {
  id: string;
  name: string;
  iconUrl?: string;
}

export interface ServiceData {
  id: string;
  name: string;
  categoryId: string;
}

export interface ZoneData {
  id: string;
  name: string;
}

export interface TechnicianDocument {
  type: string;
  fileUrl: string;
  fileName: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
}

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId?: string; // Added upiId
}

// --- Incoming API Response Shape (DTO) ---
interface TechnicianApiResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  bio?: string;
  experienceSummary?: string;
  
  onboardingStep: number;
  verificationStatus: VerificationStatus;
  verificationReason?: string;
  
  categories?: CategoryData[];
  subServices?: ServiceData[];
  serviceZones?: ZoneData[];

  categoryIds: string[];
  subServiceIds: string[];
  zoneIds: string[];

  // ✅ NEW: Request Lists from Backend
  serviceRequests: ServiceRequest[];
  zoneRequests: ZoneRequest[];
  bankUpdateRequests: BankUpdateRequest[];
  payoutStatus: PayoutStatus;

  isRateCardAgreed?: boolean;
  documents: TechnicianDocument[];
  bankDetails?: BankDetails;

  availability: {
    isOnline: boolean;
    isOnJob: boolean; // ✅ NEW
  };
  
  rating?: {
    average: number;
    count: number;
  };

  walletBalance?: {
    currentBalance: number;
    currency: string;
  };

  createdAt: string; 
}

// --- Redux State Shape ---
export interface TechnicianProfile {
  id: string;
  createdAt: string;

  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  bio?: string;
  experienceSummary?: string;

  onboardingStep: number;
  verificationStatus: VerificationStatus;
  globalRejectionReason?: string | null;

  categories?: CategoryData[];
  subServices?: ServiceData[];
  serviceZones?: ZoneData[];

  categoryIds: string[];
  subServiceIds: string[];
  zoneIds: string[];

  // ✅ NEW: Requests in State
  serviceRequests: ServiceRequest[];
  zoneRequests: ZoneRequest[];
  bankUpdateRequests: BankUpdateRequest[];
  payoutStatus: PayoutStatus;

  isRateCardAgreed?: boolean;
  documents: TechnicianDocument[];
  bankDetails?: BankDetails;

  availability: {
    isOnline: boolean;
    isOnJob: boolean;
  };
  
  rating?: {
    average: number;
    count: number;
  };

  walletBalance?: {
    currentBalance: number;
    currency: string;
  };
}

interface TechnicianState {
  profile: TechnicianProfile | null;
  loading: boolean;
  saveLoading: boolean;
  error: string | null;
  stats: {
    todayEarnings: number;
    completedJobs: number;
  };
}

const initialState: TechnicianState = {
  profile: null,
  loading: false,
  saveLoading: false,
  error: null,
  stats: {
    todayEarnings: 0,
    completedJobs: 0,
  },
};

const technicianSlice = createSlice({
  name: "technician",
  initialState,
  reducers: {
    fetchTechnicianStart(state) {
      state.loading = true;
      state.error = null;
    },

    fetchTechnicianSuccess(state, action: PayloadAction<TechnicianApiResponse>) {
      state.loading = false;
      const apiData = action.payload;

      state.profile = {
        ...apiData,
        // Ensure arrays are initialized even if API sends undefined
        serviceRequests: apiData.serviceRequests || [],
        zoneRequests: apiData.zoneRequests || [],
        bankUpdateRequests: apiData.bankUpdateRequests || [],
        payoutStatus: apiData.payoutStatus || "ACTIVE",
        globalRejectionReason: apiData.verificationReason || null,
        // Ensure isOnJob defaults to false if missing
        availability: {
            isOnline: apiData.availability?.isOnline || false,
            isOnJob: apiData.availability?.isOnJob || false
        }
      };
    },

    fetchTechnicianFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    setOnboardingStep(state, action: PayloadAction<number>) {
      if (state.profile) {
        state.profile.onboardingStep = action.payload;
      }
    },

    updatePersonalDetails(state, action: PayloadAction<{ bio: string; experienceSummary: string; avatarUrl?: string; }>) {
      if (state.profile) {
        if (action.payload.bio !== undefined) state.profile.bio = action.payload.bio;
        if (action.payload.experienceSummary !== undefined) state.profile.experienceSummary = action.payload.experienceSummary;
        if (action.payload.avatarUrl !== undefined) state.profile.avatarUrl = action.payload.avatarUrl;
      }
    },

    updateWorkPreferences(state, action: PayloadAction<{ categoryIds: string[]; subServiceIds: string[] }>) {
      if (state.profile) {
        state.profile.categoryIds = action.payload.categoryIds;
        state.profile.subServiceIds = action.payload.subServiceIds;
      }
    },

    updateZones(state, action: PayloadAction<string[]>) {
      if (state.profile) {
        state.profile.zoneIds = action.payload;
      }
    },

    updateRateAgreement(state, action: PayloadAction<{ isAgreed: boolean }>) {
      if (state.profile) {
        state.profile.isRateCardAgreed = action.payload.isAgreed;
      }
    },

    updateDocuments(state, action: PayloadAction<TechnicianDocument[]>) {
      if (state.profile) {
        state.profile.documents = action.payload;
      }
    },

    updateBankDetails(state, action: PayloadAction<BankDetails>) {
      if (state.profile) {
        state.profile.bankDetails = action.payload;
      }
    },

    updateVerificationStatus(state, action: PayloadAction<{ status: VerificationStatus; globalRejectionReason?: string; }>) {
      if (state.profile) {
        state.profile.verificationStatus = action.payload.status;
        if (action.payload.globalRejectionReason !== undefined) {
          state.profile.globalRejectionReason = action.payload.globalRejectionReason;
        }
      }
    },

    setAvailability(state, action: PayloadAction<boolean>) {
      if (state.profile) {
        state.profile.availability.isOnline = action.payload;
      }
    },
    
    // ✅ NEW: Optimistic Updates for Requests
    addServiceRequest(state, action: PayloadAction<ServiceRequest>) {
        if (state.profile) {
            state.profile.serviceRequests.push(action.payload);
        }
    },

    addZoneRequest(state, action: PayloadAction<ZoneRequest>) {
        if (state.profile) {
            state.profile.zoneRequests.push(action.payload);
        }
    },

    addBankRequest(state, action: PayloadAction<BankUpdateRequest>) {
        if (state.profile) {
            state.profile.bankUpdateRequests.push(action.payload);
            state.profile.payoutStatus = "ON_HOLD"; // Immediate UI feedback
        }
    },

    clearTechnicianData() {
      return initialState;
    },
  },
});

export const {
  fetchTechnicianStart,
  fetchTechnicianSuccess,
  fetchTechnicianFailure,
  setOnboardingStep,
  updatePersonalDetails,
  updateWorkPreferences,
  updateZones,
  updateRateAgreement,
  updateDocuments,
  updateBankDetails,
  updateVerificationStatus,
  setAvailability,
  addServiceRequest, 
  addZoneRequest,    
  addBankRequest,    
  clearTechnicianData,
} = technicianSlice.actions;

export default technicianSlice.reducer;