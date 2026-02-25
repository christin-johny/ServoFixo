
const VERSION = "/v1";

export const ADMIN_BOOKING_ENDPOINTS = { 
  BOOKINGS: `${VERSION}/admin/bookings`,
  SEARCH: `${VERSION}/admin/technicians`,
};

export const TECH_BOOKING_ENDPOINTS = { 
  TECH_BOOKING_URL: (bookingId: string) => `${VERSION}/bookings/${bookingId}/respond`,
  GET_BY_ID: (bookingId: string) => `${VERSION}/bookings/technician/${bookingId}`,
  START_JOB: (bookingId: string) => `${VERSION}/bookings/${bookingId}/start`,
  UPDATE_STATUS: (bookingId: string) => `${VERSION}/bookings/${bookingId}/status`,
  CANCEL_JOB: (bookingId: string) => `${VERSION}/bookings/${bookingId}/cancel/technician`,
  ADD_EXTRA_CHARGE: (id: string) => `${VERSION}/bookings/${id}/extras`,
  COMPLETE_JOB: (id: string) => `${VERSION}/bookings/${id}/complete`,
  GET_HISTORY: `${VERSION}/bookings/technician/history`,
};

export const BOOKING_ENDPOINTS = { 
  CREATE: `${VERSION}/bookings`, 
  GET_BY_ID: (id: string) => `${VERSION}/bookings/customer/${id}`, 
  CANCEL: (id: string) => `${VERSION}/bookings/${id}/cancel/customer`,
  EXTRA_CHARGES: (bookingId: string, chargeId: string) => 
    `${VERSION}/bookings/${bookingId}/extras/${chargeId}/respond`, 
  GET_REVIEWS: (serviceId: string) => `${VERSION}/customer/services/${serviceId}/reviews`,
  VERIFY_PAYMENT: (id: string) => `${VERSION}/bookings/${id}/payment/verify`,
  RATE: (id: string) => `${VERSION}/bookings/${id}/rate`
};
export const ADMIN_TECHNICIAN_ENDPOINTS = {
  
};