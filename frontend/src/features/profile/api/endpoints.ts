export const ADMIN_CUSTOMER_ENDPOINTS = {
  CUSTOMERS: "/admin/customers",
  CUSTOMER_BY_ID: (id: string) => `/admin/customers/${id}`,
  CUSTOMER_ADDRESSES: (id: string) => `/admin/customers/${id}/addresses`,
};

export const ADMIN_TECHNICIAN_ENDPOINTS = {
  QUEUE: "/admin/technicians/queue",
  PROFILE: (id: string) => `/admin/technicians/${id}`,
  VERIFY: (id: string) => `/admin/technicians/${id}/verify`,
  LIST: "/admin/technicians",
  BLOCK: (id: string) => `/admin/technicians/${id}/block`,
  RESOLVE_REQUEST: (id: string) => `/admin/technicians/${id}/requests/resolve`,
};

export const CUSTOMER_PROFILE_ENDPOINTS = {
  PROFILE: "/customer/profile",
  AVATAR: "/customer/profile/avatar",
  CHANGE_PASSWORD: "/customer/profile/change-password",
  ADDRESSES: "/customer/addresses",
  ADDRESS_BY_ID: (id: string) => `/customer/addresses/${id}`,
  SET_DEFAULT_ADDRESS: (id: string) => `/customer/addresses/${id}/default`,
  ZONE_BY_LOCATION: "/customer/zones/find-by-location",
};

export const TECHNICIAN_PROFILE_ENDPOINTS = {
  PROFILE_BASE: "/technician/profile",
  UPDATE_PROFILE: "/technician/profile",
  GET_RATE_CARD: "/technician/data/rate-card",
  REQUEST_SERVICE: "/technician/profile/service-request",
  REQUEST_ZONE: "/technician/profile/zone-request",
  REQUEST_BANK: "/technician/profile/bank-request",
  DISMISS_REQUEST: (requestId: string) => `/technician/profile/request/${requestId}/dismiss`,
  GET_STATUS: "/technician/profile/onboarding/status",
  UPLOAD_AVATAR: "/technician/profile/onboarding/upload/avatar",
  UPLOAD_DOCUMENT: "/technician/profile/onboarding/upload/document",
};