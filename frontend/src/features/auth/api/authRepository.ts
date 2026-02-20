import api, { refreshApi } from "../../../lib/axiosClient";
import {
  CUSTOMER_AUTH_ENDPOINTS,
  AUTH_ENDPOINTS,
} from "./endpoints";
import type {
  CustomerLoginRequestDto,
  AuthResponse,
  CustomerRegisterInitDto,
  CustomerRegisterVerifyDto,
  CustomerForgotPasswordInitDto,
  CustomerForgotPasswordVerifyDto,
} from "../../../../../shared/types/dto/AuthDtos";

export const customerLogin = async (
  payload: CustomerLoginRequestDto
): Promise<AuthResponse> => {
  const resp = await api.post(CUSTOMER_AUTH_ENDPOINTS.LOGIN, payload);
  return resp.data;
};

export const customerRegisterInitOtp = async (
  payload: CustomerRegisterInitDto
): Promise<AuthResponse> => {
  const resp = await api.post(
    CUSTOMER_AUTH_ENDPOINTS.REGISTER_INIT_OTP,
    payload
  );
  return resp.data;
};

export const customerRegisterVerifyOtp = async (
  payload: CustomerRegisterVerifyDto
): Promise<AuthResponse> => {
  const resp = await api.post(
    CUSTOMER_AUTH_ENDPOINTS.REGISTER_VERIFY_OTP,
    payload
  );
  return resp.data;
};

export const customerForgotPasswordInit = async (
  payload: CustomerForgotPasswordInitDto
): Promise<AuthResponse> => {
  const resp = await api.post(
    CUSTOMER_AUTH_ENDPOINTS.FORGOT_PASSWORD_INIT_OTP,
    payload
  );
  return resp.data;
};

export const customerForgotPasswordVerify = async (
  payload: CustomerForgotPasswordVerifyDto
): Promise<AuthResponse> => {
  const resp = await api.post(
    CUSTOMER_AUTH_ENDPOINTS.FORGOT_PASSWORD_VERIFY_OTP,
    payload
  );
  return resp.data;
};

export const refresh = async (): Promise<AuthResponse> => {
  const resp = await refreshApi.post(AUTH_ENDPOINTS.REFRESH);

  if (resp.data) {
    return resp.data;
  }
  throw new Error("Empty response from server");
};

export const customerLogout = async (): Promise<{ message?: string }> => {
  const resp = await api.post(CUSTOMER_AUTH_ENDPOINTS.LOGOUT);
  return resp.data;
};
