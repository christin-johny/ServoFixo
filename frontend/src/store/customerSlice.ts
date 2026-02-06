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

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  id: string;
  userId: string;
  tag: string;
  isDefault: boolean;
  name: string;
  phone: string;
  houseNumber: string;
  street: string;
  landmark?: string;
  city: string;
  pincode: string;
  state: string;
  location: {
    lat: number;
    lng: number;
  };
  isServiceable: boolean;
  fullAddress: string;
}

interface CustomerState {
  profile: CustomerProfile | null;
  addresses: Address[];
  currentLocationName: string;
  coords: Coordinates | null; 
  isManualLocation: boolean;
  loading: boolean;
  addressLoading: boolean; 
  error: string | null;
  
  // --- Persistent Booking State ---
  activeBookingId: string | null;
  activeBookingStatus: string | null;
  
  //  NEW: Store Technician details here
  activeTechnician: {
      name: string;
      photo?: string;
      phone?: string;
      vehicle?: string;
      otp?: string;
  } | null;
}

const initialState: CustomerState = {
  profile: null,
  addresses: [],
  currentLocationName: "Detecting Location...",
  coords: null,
  isManualLocation: false,
  loading: false,
  addressLoading: false,
  error: null,
  activeBookingId: null,
  activeBookingStatus: null,
  activeTechnician: null, 
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
    setCurrentLocation(state, action: PayloadAction<
      | string 
      | { name: string; coords: Coordinates; isManual?: boolean }
    >) {
      if (typeof action.payload === 'string') {
        state.currentLocationName = action.payload;
      } else {
        state.currentLocationName = action.payload.name;
        state.coords = action.payload.coords;
        state.isManualLocation = action.payload.isManual ?? true;
      }
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
    // --- Active Booking Reducers ---
    setActiveBooking(state, action: PayloadAction<{ id: string; status: string }>) {
      state.activeBookingId = action.payload.id;
      state.activeBookingStatus = action.payload.status;
    },
    
    //  ADDED THIS REDUCER
    setActiveTechnician(state, action: PayloadAction<CustomerState['activeTechnician']>) {
        state.activeTechnician = action.payload;
    },

    clearActiveBooking(state) {
      state.activeBookingId = null;
      state.activeBookingStatus = null;
      state.activeTechnician = null; 
    },
    updateActiveBookingStatus(state, action: PayloadAction<string>) {
      state.activeBookingStatus = action.payload;
    }
  },
});

//  ADDED setActiveTechnician TO EXPORTS BELOW
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
  setActiveBooking,
  setActiveTechnician, 
  clearActiveBooking,
  updateActiveBookingStatus
} = customerSlice.actions;

export default customerSlice.reducer;