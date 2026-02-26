import { createSlice,type PayloadAction } from "@reduxjs/toolkit";

export interface IncomingJob {
  bookingId: string;
  serviceName: string;
  earnings: number;
  distance: string;
  address: string;
  expiresAt: string; 
}

export interface ActiveJob {
  id: string;
  status: string;
  serviceName: string;
  customerName: string;
  location: string;
}

interface TechnicianBookingState {
  incomingJob: IncomingJob | null;
  activeJob: ActiveJob | null;
  isModalOpen: boolean;
}

const initialState: TechnicianBookingState = {
  incomingJob: null,
  isModalOpen: false,
  activeJob: null
};

const technicianBookingSlice = createSlice({
  name: "technicianBooking",
  initialState,
  reducers: {
    setActiveJob(state, action: PayloadAction<ActiveJob>) {
      state.activeJob = action.payload;
    },
    updateActiveJobStatus(state, action: PayloadAction<string>) {
      if (state.activeJob) {
        state.activeJob.status = action.payload;
      }
    },
    clearActiveJob(state) {
      state.activeJob = null;
    },
    setIncomingJob(state, action: PayloadAction<IncomingJob>) {
      state.incomingJob = action.payload;
      state.isModalOpen = true;
    }, 
    clearIncomingJob(state) {
      state.incomingJob = null;
      state.isModalOpen = false;
    },
  },
});

export const { setIncomingJob, clearIncomingJob,setActiveJob,updateActiveJobStatus } = technicianBookingSlice.actions;
export default technicianBookingSlice.reducer;