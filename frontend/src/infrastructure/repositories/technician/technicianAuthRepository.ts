import api from "../../api/axiosClient";
import { TECHNICIAN_AUTH_ENDPOINTS } from "../../api/endpoints/Technician/technician.endpoints";
import type { 
  AuthResponse,
  CustomerLoginRequestDto, 
  CustomerRegisterInitDto, 
  CustomerRegisterVerifyDto,
  CustomerForgotPasswordInitDto,
  CustomerForgotPasswordVerifyDto
} from "../../../domain/types/auth"; 

export const technicianLogin = async (
  payload: CustomerLoginRequestDto
): Promise<AuthResponse> => {
  const resp = await api.post(TECHNICIAN_AUTH_ENDPOINTS.LOGIN, payload);
  return resp.data;
};

export const technicianRegisterInit = async (
  payload: CustomerRegisterInitDto
): Promise<AuthResponse> => {
  const resp = await api.post(TECHNICIAN_AUTH_ENDPOINTS.REGISTER_INIT_OTP, payload);
  return resp.data;
};

export const technicianRegisterVerify = async (
  payload: CustomerRegisterVerifyDto
): Promise<AuthResponse> => {
  const resp = await api.post(TECHNICIAN_AUTH_ENDPOINTS.REGISTER_VERIFY_OTP, payload);
  return resp.data;
};

export const technicianLogout = async (): Promise<{ message?: string }> => {
  const resp = await api.post(TECHNICIAN_AUTH_ENDPOINTS.LOGOUT);
  return resp.data;
};

export const technicianForgotPasswordInit = async (
  payload: CustomerForgotPasswordInitDto
): Promise<AuthResponse> => {
  const resp = await api.post(TECHNICIAN_AUTH_ENDPOINTS.FORGOT_PASSWORD_INIT_OTP, payload);
  return resp.data;
};

export const technicianForgotPasswordVerify = async (
  payload: CustomerForgotPasswordVerifyDto
): Promise<AuthResponse> => {
  const resp = await api.post(TECHNICIAN_AUTH_ENDPOINTS.FORGOT_PASSWORD_VERIFY_OTP, payload);
  return resp.data;
};