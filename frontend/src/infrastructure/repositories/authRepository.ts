import api from "../api/axiosClient";
import type {
  CustomerLoginRequestDto,
  AuthResponse,
  CustomerRegisterInitDto,
  CustomerRegisterVerifyDto,
  CustomerForgotPasswordInitDto,
  CustomerForgotPasswordVerifyDto,
} from "../../../../shared/types/dto/AuthDtos";

/**
 * Note: backend may return { token, user?, sessionId?, message? } as AuthResponse.
 * We map token -> access token in the frontend state.
 */

export const customerLogin = async (payload: CustomerLoginRequestDto) => {
  const resp = await api.post<AuthResponse>("/api/customer/auth/login", payload);
  return resp.data;
};

export const customerRegisterInitOtp = (payload: CustomerRegisterInitDto) =>
  api.post<AuthResponse>("/api/customer/auth/register/init-otp", payload);

export const customerRegisterVerifyOtp = (payload: CustomerRegisterVerifyDto) =>
  api.post<AuthResponse>("/api/customer/auth/register/verify-otp", payload);

export const customerForgotPasswordInit = (payload: CustomerForgotPasswordInitDto) =>
  api.post<AuthResponse>("/api/customer/auth/forgot-password/init-otp", payload);

export const customerForgotPasswordVerify = (payload: CustomerForgotPasswordVerifyDto) =>
  api.post<AuthResponse>("/api/customer/auth/forgot-password/verify-otp", payload);

// refresh uses cookie (httpOnly) server-side; response shape is AuthResponse (token)
export const refresh = async () => {
  const resp = await api.post<AuthResponse>("/api/customer/auth/refresh");
  return resp.data;
};

export const logout = async () => api.post("/api/customer/auth/logout");
