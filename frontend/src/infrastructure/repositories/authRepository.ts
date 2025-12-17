import api from "../api/axiosClient";
import { refreshApi } from "../api/axiosClient";
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
  const resp = await refreshApi.post('/auth/refresh'); 
    
  if (resp.data) {
    return resp.data;
  }
    
  throw new Error("Empty response from server");
};


export const customerLogout = async (): Promise<{ message?: string }> => {
  const resp = await api.post("/customer/auth/logout");
  return resp.data;
};
