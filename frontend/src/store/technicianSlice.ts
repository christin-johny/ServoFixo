import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
 
export type VerificationStatus = "PENDING"  | "VERIFICATION_PENDING"| "VERIFIED" | "REJECTED";

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

export interface TechnicianProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  
  // Step 1: Personal
  avatarUrl?: string;
  bio?: string;
  experienceSummary?: string;
  
  // State
  onboardingStep: number;
  verificationStatus: VerificationStatus;
  
  // Step 2: Work Preferences
  categoryIds: string[];
  subServiceIds: string[];
  
  // Step 3: Zones
  zoneIds: string[];

  // Step 4: Rates   
  isRateCardAgreed?: boolean;
  
  // Step 5: Documents
  documents: TechnicianDocument[];
  
  // Step 6: Bank
  bankDetails?: BankDetails;

  // Dashboard Specifics
  availability: {
    isOnline: boolean;
  };
  walletBalance?: {
    currentBalance: number;
    currency: string;
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
    completedJobs: 0
  }
};

const technicianSlice = createSlice({
  name: "technician",
  initialState,
  reducers: {
    // --- Fetching Profile ---
    fetchTechnicianStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTechnicianSuccess(state, action: PayloadAction<TechnicianProfile>) {
      state.loading = false;
      state.profile = action.payload;
    },
    fetchTechnicianFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },

    // --- Onboarding Specific Updates ---
    
    setOnboardingStep(state, action: PayloadAction<number>) {
      if (state.profile) {
        state.profile.onboardingStep = action.payload;
      }
    },

    updatePersonalDetails(state, action: PayloadAction<{ bio: string; experienceSummary: string; avatarUrl?: string }>) {
      if (state.profile) {
        state.profile.bio = action.payload.bio;
        state.profile.experienceSummary = action.payload.experienceSummary;
        if (action.payload.avatarUrl) state.profile.avatarUrl = action.payload.avatarUrl;
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

    updateVerificationStatus(state, action: PayloadAction<VerificationStatus>) {
      if (state.profile) {
        state.profile.verificationStatus = action.payload;
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
  clearTechnicianData
} = technicianSlice.actions;

export default technicianSlice.reducer;