import { createSlice,type PayloadAction } from "@reduxjs/toolkit";

export interface IncomingJob {
  bookingId: string;
  serviceName: string;
  earnings: number;
  distance: string;
  address: string;
  expiresAt: string; // ISO timestamp from backend
}

interface TechnicianBookingState {
  incomingJob: IncomingJob | null;
  isModalOpen: boolean;
}

const initialState: TechnicianBookingState = {
  incomingJob: null,
  isModalOpen: false,
};

const technicianBookingSlice = createSlice({
  name: "technicianBooking",
  initialState,
  reducers: {
    // Called when Socket receives 'booking:assign_request'
    setIncomingJob(state, action: PayloadAction<IncomingJob>) {
      state.incomingJob = action.payload;
      state.isModalOpen = true;
    },
    // Called on Reject, Timeout, or Accept
    clearIncomingJob(state) {
      state.incomingJob = null;
      state.isModalOpen = false;
    },
  },
});

export const { setIncomingJob, clearIncomingJob } = technicianBookingSlice.actions;
export default technicianBookingSlice.reducer;