import api from "../../api/axiosClient";
import { BOOKING_ENDPOINTS } from "../../api/endpoints/Booking/booking.endpoints";
 
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
 
interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
 

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
export interface ReviewResponse {
  id: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface BookingResponse {
  id: string;
  status: string;  
  serviceId: string;
  customerId: string;
  technicianId?: string | null;
  snapshots?: {
    technician?: {
      name: string;
      phone: string;
      avatarUrl?: string;
      rating?: number;
    };
    service?: {
      name: string;
      categoryId: string; 
      imageUrls?: string[]; 
    };
  }; 
  pricing?: {
      final?: number;
      estimated?: number;
  };
  payment?: {
      status: string;
      amountPaid?: number;
      razorpayPaymentId?:string;

  };
  isRated?: boolean;
  timestamps?: {
    createdAt: string;
    updatedAt: string;
    scheduledAt?: string;
  };
}
export interface GetBookingsParams {
    page?: number;
    limit?: number;
    status?: string;  
}

export const getMyBookings = async (params: GetBookingsParams): Promise<PaginatedData<BookingResponse>> => {
    const response = await api.get(BOOKING_ENDPOINTS.CREATE, { params });
    const responseData = response.data as ApiResponse<PaginatedData<BookingResponse>>;
    return responseData.data;
};

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
 
export const getActiveBooking = async (): Promise<BookingResponse | null> => { 
  const response = await api.get(
      BOOKING_ENDPOINTS.CREATE, 
      {
          params: { 
              status: 'active', 
              limit: 1, 
              sort: '-createdAt' 
          }
      }
  );
 
  const responseData = response.data as ApiResponse<PaginatedData<BookingResponse>>;
 
  const bookings = responseData?.data?.data;

  if (Array.isArray(bookings) && bookings.length > 0) {
      return bookings[0];
  }
  
  return null;
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

export const getServiceReviews = async (serviceId: string): Promise<ReviewResponse[]> => { 
  const response = await api.get(BOOKING_ENDPOINTS.GET_REVIEWS(serviceId)); 
  return response.data.data;
};
