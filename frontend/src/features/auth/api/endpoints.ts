export const ADMIN_AUTH_ENDPOINTS = {
  LOGIN: "/admin/auth/login",
  LOGOUT: "/admin/auth/logout",
};

export const CUSTOMER_AUTH_ENDPOINTS = {
  LOGIN: "/customer/auth/login",
  REGISTER_INIT_OTP: "/customer/auth/register/init-otp",
  REGISTER_VERIFY_OTP: "/customer/auth/register/verify-otp",
  FORGOT_PASSWORD_INIT_OTP: "/customer/auth/forgot-password/init-otp",
  FORGOT_PASSWORD_VERIFY_OTP: "/customer/auth/forgot-password/verify-otp",
  LOGOUT: "/customer/auth/logout",
};

export const TECHNICIAN_AUTH_ENDPOINTS = {
  LOGIN: "/technician/auth/login",
  REGISTER_INIT_OTP: "/technician/auth/register/init-otp",
  REGISTER_VERIFY_OTP: "/technician/auth/register/verify-otp",
  LOGOUT: "/technician/auth/logout",
  FORGOT_PASSWORD_INIT_OTP: "/technician/auth/forgot-password/init-otp",
  FORGOT_PASSWORD_VERIFY_OTP: "/technician/auth/forgot-password/verify-otp",
};

export const AUTH_ENDPOINTS = {
  REFRESH: "/auth/refresh",
};