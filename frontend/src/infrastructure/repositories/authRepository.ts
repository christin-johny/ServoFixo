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

export const customerLogin = async (
  payload: CustomerLoginRequestDto
): Promise<AuthResponse> => {
  const resp = await api.post("/customer/auth/login", payload);
  return resp.data;
};

export const customerRegisterInitOtp = async (
  payload: CustomerRegisterInitDto
): Promise<AuthResponse> => {
  const resp = await api.post("/customer/auth/register/init-otp", payload);
  return resp.data;
};

export const customerRegisterVerifyOtp = async (
  payload: CustomerRegisterVerifyDto
): Promise<AuthResponse> => {
  const resp = await api.post("/customer/auth/register/verify-otp", payload);
  return resp.data;
};

export const customerForgotPasswordInit = async (
  payload: CustomerForgotPasswordInitDto
): Promise<AuthResponse> => {
  const resp = await api.post(
    "/customer/auth/forgot-password/init-otp",
    payload
  );
  return resp.data;
};

export const customerForgotPasswordVerify = async (
  payload: CustomerForgotPasswordVerifyDto
): Promise<AuthResponse> => {
  const resp = await api.post(
    "/customer/auth/forgot-password/verify-otp",
    payload
  );
  return resp.data;
};

export const refresh = async (): Promise<AuthResponse> => {
  let lastError: unknown = null;

  for (const endpoint of REFRESH_ENDPOINTS) {
    try {
      const resp = await refreshApi.post(endpoint);

      if (resp.data) {
        return resp.data;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("Unable to refresh session");
};
export const customerLogout = async (): Promise<{ message?: string }> => {
  const resp = await api.post("/customer/auth/logout");
  return resp.data;
};
