import api from "../api/axiosClient";

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
  try {
    // ✅ REMOVED <AuthResponse>
    const resp = await api.post("/api/auth/refresh");
    return resp.data;
  } catch (err) {
    // ✅ REMOVED <AuthResponse>
    const resp = await api.post("/api/customer/auth/refresh");
    return resp.data;
  }
};

// --- 5. Logout ---

export const customerLogout = async (): Promise<{ message?: string }> => {
  // ✅ REMOVED <{ message?: string }>
  const resp = await api.post("/api/customer/auth/logout");
  return resp.data;
};