import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface CustomerProfile {
  id: string; 
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  defaultZoneId?: string;
  suspended: boolean;
  googleId?: string;
  createdAt?: string;
}

export interface Address {
  name: string;
  id: string;
  tag: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  isServiceable: boolean;
}

interface CustomerState {
  profile: CustomerProfile | null;
  addresses: Address[];
  currentLocationName: string;
  loading: boolean;
  addressLoading: boolean; 
  error: string | null;
}

const initialState: CustomerState = {
  profile: null,
  addresses: [],
  currentLocationName: "Detecting Location...",
  loading: false,
  addressLoading: false,
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
    fetchAddressesStart(state) {
      state.addressLoading = true;
    },
    setAddresses(state, action: PayloadAction<Address[]>) {
      state.addressLoading = false;
      state.addresses = action.payload;
    },
    setCurrentLocation(state, action: PayloadAction<string>) {
      state.currentLocationName = action.payload;
    },
    clearCustomerData() {
      return initialState;
    },
    updateProfileSuccess(state, action: PayloadAction<Partial<CustomerProfile>>) {
    if (state.profile) {
      state.profile = { ...state.profile, ...action.payload };
    }
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
  fetchAddressesStart,
  setAddresses,
  setCurrentLocation,
  clearCustomerData,
  updateProfileSuccess,
  updateAvatar,
} = customerSlice.actions;

export default customerSlice.reducer;