import api from "../../api/axiosClient";
import { BOOKING_ENDPOINTS } from "../../api/endpoints/Booking/booking.endpoints";

export interface CreateBookingPayload {
  serviceId: string;
  customerId: string; // Explicitly passed or handled by backend token
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  requestedTime: string; // ISO String
  meta?: {
    instructions?: string;
  };
}

export interface BookingResponse {
  id: string;
  status: string;
  serviceId: string;
  customerId: string;
  // Add other fields as needed
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