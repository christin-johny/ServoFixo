import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CustomerProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  defaultZoneId?: string;
  addresses: [];
  suspended: boolean;
  googleId?: string;
  createdAt?: string;
}

interface CustomerState {
  profile: CustomerProfile | null;
  loading: boolean;
  error: string | null;
}

const initialState: CustomerState = {
  profile: null,
  loading: false,
  error: null,
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    fetchProfileStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchProfileSuccess(state, action: PayloadAction<CustomerProfile>) {
      state.loading = false;
      state.profile = action.payload;
    },
    fetchProfileFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    clearCustomerData(state) {
      state.profile = null;
      state.loading = false;
      state.error = null;
    },
    updateAvatar(state, action: PayloadAction<string>) {
      if (state.profile) {
        state.profile.avatarUrl = action.payload;
      }
    },
  },
});

export const {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  clearCustomerData,
  updateAvatar,
} = customerSlice.actions;

export default customerSlice.reducer;
