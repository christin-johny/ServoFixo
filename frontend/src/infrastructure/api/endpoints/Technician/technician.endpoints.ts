export const TECHNICIAN_AUTH_ENDPOINTS = {
  LOGIN: "/technician/auth/login",
  REGISTER_INIT_OTP: "/technician/auth/register/init-otp",
  REGISTER_VERIFY_OTP: "/technician/auth/register/verify-otp",
  LOGOUT: "/technician/auth/logout",
  FORGOT_PASSWORD_INIT_OTP: "/technician/auth/forgot-password/init-otp",
  FORGOT_PASSWORD_VERIFY_OTP: "/technician/auth/forgot-password/verify-otp",
};

export const TECHNICIAN_PROFILE_ENDPOINTS = {
  PROFILE_BASE: "/technician/profile",

  UPDATE_PROFILE: "/technician/profile",
  GET_CATEGORIES: "/technician/data/categories",
  GET_SERVICES: "/technician/data/services",
  GET_ZONES: "/technician/data/zones",
  // Read Status
  GET_STATUS: "/technician/profile/onboarding/status",
  GET_RATE_CARD:'/technician/data/rate-card',

  // Write Steps (Strictly mapped to Backend)
  STEP_1_PERSONAL: "/technician/profile/onboarding/step-1",
  STEP_2_PREFERENCES: "/technician/profile/onboarding/step-2",
  STEP_3_ZONES: "/technician/profile/onboarding/step-3",
  STEP_4_RATES: "/technician/profile/onboarding/step-4",
  STEP_5_DOCUMENTS: "/technician/profile/onboarding/step-5",
  STEP_6_BANK: "/technician/profile/onboarding/step-6",

  // File Uploads (Two separate endpoints as agreed)
  UPLOAD_AVATAR: "/technician/profile/onboarding/upload/avatar",
  UPLOAD_DOCUMENT: "/technician/profile/onboarding/upload/document",
};
