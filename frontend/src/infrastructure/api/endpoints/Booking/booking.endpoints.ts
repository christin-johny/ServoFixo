export const BOOKING_ENDPOINTS = {
  CREATE: "/bookings", 
  GET_BY_ID: (id: string) => `/bookings/customer/${id}`, 
  CANCEL: (id: string) => `/bookings/${id}/cancel/customer`,
  EXTRA_CHARGES:(bookingId:string,chargeId:string)=>`/bookings/${bookingId}/extras/${chargeId}/respond`,
  GET_REVIEWS:(serviceId:string)=>`customer/services/${serviceId}/reviews`
};