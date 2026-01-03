import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import customerReducer from './customerSlice';
import technicianReducer from './technicianSlice';  

const store = configureStore({
  reducer: {
    auth: authReducer,
    customer: customerReducer,
    technician: technicianReducer  
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;