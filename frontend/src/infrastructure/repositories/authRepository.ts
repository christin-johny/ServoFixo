import api from "../api/axiosClient";
import type {
  CustomerLoginRequestDto,
  AuthResponse,
  CustomerRegisterInitDto,
  CustomerRegisterVerifyDto,
  CustomerForgotPasswordInitDto,
  CustomerForgotPasswordVerifyDto,
} from "../../../../shared/types/dto/AuthDtos";



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

// inside src/infrastructure/repositories/authRepository.ts (replace existing refresh)
export const refresh = async () => {
  // prefer shared endpoint
  try {
    const resp = await api.post<AuthResponse>("/api/auth/refresh");
    return resp.data;
  } catch (err) {
    // fallback to customer refresh to preserve compatibility
    const resp = await api.post<AuthResponse>("/api/customer/auth/refresh");
    return resp.data;
  }
};


export const  customerLogout = async (): Promise<{ message?: string }> => {
  const resp = await api.post("/api/customer/auth/logout");
  return resp.data;
};
