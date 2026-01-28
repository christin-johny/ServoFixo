export const BOOKING_ENDPOINTS = {
  CREATE: "/bookings", 
  GET_BY_ID: (id: string) => `/bookings/customer/${id}`, 
  CANCEL: (id: string) => `/bookings/${id}/cancel/customer`,
};