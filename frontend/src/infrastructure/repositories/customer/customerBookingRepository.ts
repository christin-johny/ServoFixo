import api from "../../api/axiosClient";
import { BOOKING_ENDPOINTS } from "../../api/endpoints/Booking/booking.endpoints";

export interface CreateBookingPayload {
  serviceId: string;
  customerId: string;
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

//  Corrected Interface to match Backend Response
export interface BookingResponse {
  id: string;
  status: string;
  serviceId: string;
  customerId: string;
  technicianId?: string | null;
  
  // Snapshots (Fixes 'Property snapshots does not exist' error)
  snapshots?: {
    technician?: {
      name: string;
      phone: string;
      avatarUrl?: string;
      rating?: number;
    };
    customer?: {
      name: string;
      phone: string;
      avatarUrl?: string;
    };
    service?: {
      name: string;
      categoryId: string;
    };
  };

  // Meta (Fixes 'Property meta does not exist' error)
  meta?: {
    instructions?: string;
    otp?: string;
  };

  // Timestamps
  timestamps?: {
    createdAt: string;
    updatedAt: string;
    scheduledAt?: string;
  };
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

export const cancelBooking = async (id: string, reason: string): Promise<void> => {
    await api.post(BOOKING_ENDPOINTS.CANCEL(id), { reason });
};

export const respondToExtraCharge = async (
  bookingId: string, 
  chargeId: string, 
  response: "APPROVE" | "REJECT"
): Promise<void> => { 
    await api.post(BOOKING_ENDPOINTS.EXTRA_CHARGES(bookingId,chargeId), { 
        response 
    });
};