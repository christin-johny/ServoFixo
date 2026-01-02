export const CUSTOMER_AUTH_ENDPOINTS = {
  LOGIN: "/customer/auth/login",

  REGISTER_INIT_OTP: "/customer/auth/register/init-otp",
  REGISTER_VERIFY_OTP: "/customer/auth/register/verify-otp",

  FORGOT_PASSWORD_INIT_OTP: "/customer/auth/forgot-password/init-otp",
  FORGOT_PASSWORD_VERIFY_OTP: "/customer/auth/forgot-password/verify-otp",

  LOGOUT: "/customer/auth/logout",
};

export const AUTH_ENDPOINTS = {
  REFRESH: "/auth/refresh",
};

export const CUSTOMER_ENDPOINTS = {
  PROFILE: "/customer/profile",
  AVATAR: "/customer/profile/avatar",
  CHANGE_PASSWORD: "/customer/profile/change-password",

  ZONE_BY_LOCATION: "/customer/zones/find-by-location",

  ADDRESSES: "/customer/addresses",
  ADDRESS_BY_ID: (id: string) => `/customer/addresses/${id}`,
  SET_DEFAULT_ADDRESS: (id: string) =>
    `/customer/addresses/${id}/default`,
};

export const CUSTOMER_SERVICE_ENDPOINTS = {
  CATEGORIES: "/customer/categories",
  POPULAR_SERVICES: "/customer/services/popular",
  SERVICES: "/customer/services",
   SERVICE_BY_ID: (id: string) => `/customer/services/${id}`,
};

