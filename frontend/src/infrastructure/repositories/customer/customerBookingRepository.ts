import api from "../../api/axiosClient";
import { BOOKING_ENDPOINTS } from "../../api/endpoints/Booking/booking.endpoints";

export interface CreateBookingPayload {
  serviceId: string;
  customerId: string;
  // zoneId is NOT sent here (Backend calculates it now)
  
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
 
  contact: {
    name: string;
    phone: string;
  };

  requestedTime: string;
  meta?: {
    instructions?: string;
  };
}

export interface BookingResponse {
  id: string;
  status: string;
  serviceId: string;
  customerId: string;
}

export const createBooking = async (
  data: CreateBookingPayload
): Promise<BookingResponse> => {
  const response = await api.post(BOOKING_ENDPOINTS.CREATE, data);
  return response.data.data;
};

export const getBookingById = async (id: string): Promise<BookingResponse> => {
  const response = await api.get(BOOKING_ENDPOINTS.GET_BY_ID(id));
  return response.data.data;
};