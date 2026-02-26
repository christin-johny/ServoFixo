 
const VERSION = "/v1";

export const ADMIN_CUSTOMER_ENDPOINTS = {
  CUSTOMERS: `${VERSION}/admin/customers`,
  CUSTOMER_BY_ID: (id: string) => `${VERSION}/admin/customers/${id}`,
  CUSTOMER_ADDRESSES: (id: string) => `${VERSION}/admin/customers/${id}/addresses`,
};

export const ADMIN_TECHNICIAN_ENDPOINTS = {
  QUEUE: `${VERSION}/admin/technicians/queue`,
  PROFILE: (id: string) => `${VERSION}/admin/technicians/${id}`,
  VERIFY: (id: string) => `${VERSION}/admin/technicians/${id}/verify`,
  LIST: `${VERSION}/admin/technicians`,
  BLOCK: (id: string) => `${VERSION}/admin/technicians/${id}/block`,
  RESOLVE_REQUEST: (id: string) => `${VERSION}/admin/technicians/${id}/requests/resolve`,
};

export const CUSTOMER_PROFILE_ENDPOINTS = {
  PROFILE: `${VERSION}/customer/profile`,
  AVATAR: `${VERSION}/customer/profile/avatar`,
  CHANGE_PASSWORD: `${VERSION}/customer/profile/change-password`,
  ADDRESSES: `${VERSION}/customer/addresses`,
  ADDRESS_BY_ID: (id: string) => `${VERSION}/customer/addresses/${id}`,
  SET_DEFAULT_ADDRESS: (id: string) => `${VERSION}/customer/addresses/${id}/default`,
  ZONE_BY_LOCATION: `${VERSION}/customer/zones/find-by-location`,
  CHAT_HISTORY:`${VERSION}/customer/chat/history`
};

export const TECHNICIAN_PROFILE_ENDPOINTS = {
  PROFILE_BASE: `${VERSION}/technician/profile`,
  UPDATE_PROFILE: `${VERSION}/technician/profile`,
  GET_RATE_CARD: `${VERSION}/technician/data/rate-card`,
  REQUEST_SERVICE: `${VERSION}/technician/profile/service-request`,
  REQUEST_ZONE: `${VERSION}/technician/profile/zone-request`,
  REQUEST_BANK: `${VERSION}/technician/profile/bank-request`,
  DISMISS_REQUEST: (requestId: string) => `${VERSION}/technician/profile/request/${requestId}/dismiss`,
  GET_STATUS: `${VERSION}/technician/profile/onboarding/status`,
  UPLOAD_AVATAR: `${VERSION}/technician/profile/onboarding/upload/avatar`,
  UPLOAD_DOCUMENT: `${VERSION}/technician/profile/onboarding/upload/document`,
  TOGGLE_ONLINE: `${VERSION}/technician/profile/status`,
};