import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type VerificationStatus =
  | "PENDING"
  | "VERIFICATION_PENDING"
  | "VERIFIED"
  | "REJECTED";

// --- Helper Interfaces ---
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
}

// --- Incoming API Response Shape (DTO) ---
// This matches what the backend Controller sends
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
  verificationReason?: string; // Backend sends this
  globalRejectionReason?: string; // Or this (fallback)

  categories?: CategoryData[];
  subServices?: ServiceData[];
  serviceZones?: ZoneData[];

  categoryIds: string[];
  subServiceIds: string[];
  zoneIds: string[];

  isRateCardAgreed?: boolean;
  documents: TechnicianDocument[];
  bankDetails?: BankDetails;

  availability: {
    isOnline: boolean;
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

  // ✅ Flattened Fields (No personalDetails object)
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  bio?: string;
  experienceSummary?: string;

  onboardingStep: number;
  verificationStatus: VerificationStatus;
  globalRejectionReason?: string | null; // Frontend standardizes on this

  // Hydrated Data
  categories?: CategoryData[];
  subServices?: ServiceData[];
  serviceZones?: ZoneData[];

  // Raw IDs
  categoryIds: string[];
  subServiceIds: string[];
  zoneIds: string[];

  isRateCardAgreed?: boolean;
  documents: TechnicianDocument[];
  bankDetails?: BankDetails;

  availability: {
    isOnline: boolean;
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

    // ✅ Typed Payload: Accepts the API response structure
    fetchTechnicianSuccess(state, action: PayloadAction<TechnicianApiResponse>) {
      state.loading = false;
      const apiData = action.payload;

      // Map API response to State Profile
      state.profile = {
        ...apiData,
        // Ensure consistent naming for rejection reason
        globalRejectionReason: apiData.verificationReason || apiData.globalRejectionReason || null,
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

    // ✅ Updated: Updates root fields directly
    updatePersonalDetails(
      state,
      action: PayloadAction<{
        bio: string;
        experienceSummary: string;
        avatarUrl?: string;
      }>
    ) {
      if (state.profile) {
        if (action.payload.bio !== undefined) state.profile.bio = action.payload.bio;
        if (action.payload.experienceSummary !== undefined) state.profile.experienceSummary = action.payload.experienceSummary;
        if (action.payload.avatarUrl !== undefined) state.profile.avatarUrl = action.payload.avatarUrl;
      }
    },

    updateWorkPreferences(
      state,
      action: PayloadAction<{ categoryIds: string[]; subServiceIds: string[] }>
    ) {
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

    updateVerificationStatus(
      state,
      action: PayloadAction<{
        status: VerificationStatus;
        globalRejectionReason?: string;
      }>
    ) {
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
  clearTechnicianData,
} = technicianSlice.actions;

export default technicianSlice.reducer;