export const ADMIN_BOOKING_ENDPOINTS = {
  BOOKINGS: "/admin/bookings",
};

export const TECH_BOOKING_ENDPOINTS = {
  TECH_BOOKING_URL: (bookingId: string) => `/bookings/${bookingId}/respond`,
  GET_BY_ID: (bookingId: string) => `/bookings/technician/${bookingId}`,
  START_JOB: (bookingId: string) => `/bookings/${bookingId}/start`,
  UPDATE_STATUS: (bookingId: string) => `/bookings/${bookingId}/status`,
  CANCEL_JOB: (bookingId: string) => `/bookings/${bookingId}/cancel/technician`,
  ADD_EXTRA_CHARGE: (id: string) => `/bookings/${id}/extras`,
  COMPLETE_JOB: (id: string) => `/bookings/${id}/complete`,
  GET_HISTORY: "/bookings/technician/history",
};

export const BOOKING_ENDPOINTS = {
  CREATE: "/bookings", 
  GET_BY_ID: (id: string) => `/bookings/customer/${id}`, 
  CANCEL: (id: string) => `/bookings/${id}/cancel/customer`,
  EXTRA_CHARGES:(bookingId:string,chargeId:string)=>`/bookings/${bookingId}/extras/${chargeId}/respond`,
  GET_REVIEWS:(serviceId:string)=>`customer/services/${serviceId}/reviews`
};