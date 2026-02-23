 
const VERSION = "/v1";

export const ADMIN_AUTH_ENDPOINTS = {
  LOGIN: `${VERSION}/admin/auth/login`,
  LOGOUT: `${VERSION}/admin/auth/logout`,
};

export const CUSTOMER_AUTH_ENDPOINTS = {
  LOGIN: `${VERSION}/customer/auth/login`,
  REGISTER_INIT_OTP: `${VERSION}/customer/auth/register/init-otp`,
  REGISTER_VERIFY_OTP: `${VERSION}/customer/auth/register/verify-otp`,
  FORGOT_PASSWORD_INIT_OTP: `${VERSION}/customer/auth/forgot-password/init-otp`,
  FORGOT_PASSWORD_VERIFY_OTP: `${VERSION}/customer/auth/forgot-password/verify-otp`,
  LOGOUT: `${VERSION}/customer/auth/logout`,
};

export const TECHNICIAN_AUTH_ENDPOINTS = {
  LOGIN: `${VERSION}/technician/auth/login`,
  REGISTER_INIT_OTP: `${VERSION}/technician/auth/register/init-otp`,
  REGISTER_VERIFY_OTP: `${VERSION}/technician/auth/register/verify-otp`,
  LOGOUT: `${VERSION}/technician/auth/logout`,
  FORGOT_PASSWORD_INIT_OTP: `${VERSION}/technician/auth/forgot-password/init-otp`,
  FORGOT_PASSWORD_VERIFY_OTP: `${VERSION}/technician/auth/forgot-password/verify-otp`,
};

export const AUTH_ENDPOINTS = { 
  REFRESH: `${VERSION}/auth/refresh`,
};