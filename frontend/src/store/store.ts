import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import customerReducer from './customerSlice'
const store = configureStore({
  reducer: {
    auth: authReducer,
    customer:customerReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
