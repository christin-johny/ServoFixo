import api from "../api/axiosClient";
import { refreshApi } from "../api/axiosClient";
import { REFRESH_ENDPOINTS } from "../config/authConfig";
import type {
  CustomerLoginRequestDto,
  AuthResponse,
  CustomerRegisterInitDto,
  CustomerRegisterVerifyDto,
  CustomerForgotPasswordInitDto,
  CustomerForgotPasswordVerifyDto,
} from "../../../../shared/types/dto/AuthDtos";

// --- 1. Login ---
export const customerLogin = async (payload: CustomerLoginRequestDto): Promise<AuthResponse> => {
  // ✅ REMOVED <AuthResponse>
  const resp = await api.post("/api/customer/auth/login", payload);
  return resp.data;
};

// --- 2. Registration ---

export const customerRegisterInitOtp = async (payload: CustomerRegisterInitDto): Promise<AuthResponse> => {
  // ✅ REMOVED <AuthResponse>
  const resp = await api.post("/api/customer/auth/register/init-otp", payload);
  return resp.data;
};

export const customerRegisterVerifyOtp = async (payload: CustomerRegisterVerifyDto): Promise<AuthResponse> => {
  // ✅ REMOVED <AuthResponse>
  const resp = await api.post("/api/customer/auth/register/verify-otp", payload);
  return resp.data;
};

// --- 3. Forgot Password ---

export const customerForgotPasswordInit = async (payload: CustomerForgotPasswordInitDto): Promise<AuthResponse> => {
  // ✅ REMOVED <AuthResponse>
  const resp = await api.post("/api/customer/auth/forgot-password/init-otp", payload);
  return resp.data;
};

export const customerForgotPasswordVerify = async (payload: CustomerForgotPasswordVerifyDto): Promise<AuthResponse> => {
  // ✅ REMOVED <AuthResponse>
  const resp = await api.post("/api/customer/auth/forgot-password/verify-otp", payload);
  return resp.data;
};

// --- 4. Refresh Token ---

export const refresh = async (): Promise<AuthResponse> => {
  let lastError: unknown = null;

  for (const endpoint of REFRESH_ENDPOINTS) {
    try {
      // We use the pure 'refreshApi' instance here.
      // This is safe to call during App initialization.
      const resp = await refreshApi.post(endpoint);
      
      if (resp.data) {
        return resp.data; // Return immediately on success
      }
    } catch (err) {
      lastError = err;
      // Continue loop...
    }
  }

  // If loop finishes without success, throw error (App.tsx handles this as "Not Logged In")
  throw lastError || new Error("Unable to refresh session");
};
// --- 5. Logout ---

export const customerLogout = async (): Promise<{ message?: string }> => {
  const resp = await api.post("/api/customer/auth/logout");
  return resp.data;
};