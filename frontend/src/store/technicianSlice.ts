import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { 
  ServiceRequest, 
  ZoneRequest, 
  BankUpdateRequest, 
} from "../domain/types/TechnicianRequestTypes";

import type {PayoutStatus}  from '../../../shared/types/value-objects/TechnicianTypes'
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
  upiId?: string; 
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

  // Requests
  serviceRequests: ServiceRequest[];
  zoneRequests: ZoneRequest[];
  bankUpdateRequests: BankUpdateRequest[];
  payoutStatus: PayoutStatus;

  // ✅ restored
  isRateCardAgreed?: boolean;

  documents: TechnicianDocument[];
  bankDetails?: BankDetails;

  walletBalance?: {
    currentBalance: number;
    frozenAmount: number;
    currency: string;
  };

  availability: {
    isOnline: boolean;
    isOnJob: boolean; 
  };
  
  rating?: {
    average: number;
    count: number;
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

  // ✅ restored
  isRateCardAgreed?: boolean;

  documents: TechnicianDocument[];
  bankDetails?: BankDetails;

  walletBalance: {
    currentBalance: number;
    frozenAmount: number;
    currency: string;
  };

  availability: {
    isOnline: boolean;
    isOnJob: boolean;
  };
  
  rating?: {
    average: number;
    count: number;
  };
}

interface TechnicianState {
  profile: TechnicianProfile | null;
  loading: boolean;
  saveLoading: boolean;
  error: string | null;
}

const initialState: TechnicianState = {
  profile: null,
  loading: false,
  saveLoading: false,
  error: null,
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
        serviceRequests: apiData.serviceRequests || [],
        zoneRequests: apiData.zoneRequests || [],
        bankUpdateRequests: apiData.bankUpdateRequests || [],
        payoutStatus: apiData.payoutStatus || "ACTIVE",
        
        globalRejectionReason: apiData.verificationReason || null,
        
        walletBalance: apiData.walletBalance || {
            currentBalance: 0,
            frozenAmount: 0,
            currency: "INR"
        },
        
        availability: {
            isOnline: apiData.availability?.isOnline || false,
            isOnJob: apiData.availability?.isOnJob || false
        },

        documents: apiData.documents || [],
        rating: apiData.rating || { average: 0, count: 0 }
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

    // ✅ Restored missing export for Step4_Rates.tsx
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
    dismissRequestAlert(state, action: PayloadAction<string>) {
      if (state.profile) {
        const requestId = action.payload;

        // Scan and update isDismissed in all potential arrays
        state.profile.serviceRequests = state.profile.serviceRequests.map((r) =>
          r.id === requestId ? { ...r, isDismissed: true } : r
        );
        state.profile.zoneRequests = state.profile.zoneRequests.map((r) =>
          r.id === requestId ? { ...r, isDismissed: true } : r
        );
        state.profile.bankUpdateRequests = state.profile.bankUpdateRequests.map((r) =>
          r.id === requestId ? { ...r, isDismissed: true } : r
        );
      }
    },
    
    // ✅ Optimistic Updates
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
            state.profile.payoutStatus = "ON_HOLD"; 
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
  updateRateAgreement ,
  updateDocuments,
  updateBankDetails,
  updateVerificationStatus,
  setAvailability,
  addServiceRequest, 
  addZoneRequest,
  dismissRequestAlert,    
  addBankRequest,    
  clearTechnicianData,
} = technicianSlice.actions;

export default technicianSlice.reducer;