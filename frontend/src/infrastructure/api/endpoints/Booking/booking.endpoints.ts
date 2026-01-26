export const BOOKING_ENDPOINTS = {
  CREATE: "/bookings",
  GET_BY_ID: (id: string) => `/bookings/${id}`,
  CANCEL: (id: string) => `/bookings/${id}/cancel`,
};