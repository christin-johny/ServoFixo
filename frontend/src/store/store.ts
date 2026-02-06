import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import customerReducer from './customerSlice';
import technicianReducer from './technicianSlice';  
import notificationReducer from './notificationSlice';
import technicianBookingReducer from './technicianBookingSlice';
const store = configureStore({
  reducer: {
    auth: authReducer,
    customer: customerReducer,
    technician: technicianReducer,
    notifications:notificationReducer,
    technicianBooking: technicianBookingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;