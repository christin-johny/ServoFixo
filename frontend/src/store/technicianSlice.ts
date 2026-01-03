import { createSlice,type PayloadAction } from "@reduxjs/toolkit";

// 1. Define Types matching your Backend DTOs
export type VerificationStatus = "PENDING" | "VERIFICATION_PENDING" | "VERIFIED" | "REJECTED";

export interface TechnicianProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  bio?: string;
  experienceSummary?: string;
  onboardingStep: number;
  verificationStatus: VerificationStatus;
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
    updateVerificationStatus(state, action: PayloadAction<VerificationStatus>) {
      if (state.profile) {
        state.profile.verificationStatus = action.payload;
      }
    },

    // --- Profile Updates (Partial) ---
    updateTechnicianProfile(state, action: PayloadAction<Partial<TechnicianProfile>>) {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },

    // --- Availability Toggle ---
    setAvailability(state, action: PayloadAction<boolean>) {
      if (state.profile) {
        state.profile.availability.isOnline = action.payload;
      }
    },

    // --- Logout / Cleanup ---
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
  updateVerificationStatus,
  updateTechnicianProfile,
  setAvailability,
  clearTechnicianData
} = technicianSlice.actions;

export default technicianSlice.reducer;