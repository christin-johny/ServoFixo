import { ADMIN_BOOKING_ENDPOINTS } from "../../api/endpoints/Admin/admin.endpoints";
import api from "../../api/axiosClient";
 

export type BookingStatus = 
  | "REQUESTED" | "ASSIGNED_PENDING" | "ACCEPTED" | "EN_ROUTE" 
  | "REACHED" | "IN_PROGRESS" | "EXTRAS_PENDING" 
  | "COMPLETED" | "PAID" | "CANCELLED" 
  | "FAILED_ASSIGNMENT" | "TIMEOUT" | "CANCELLED_BY_TECH";

export interface BookingSnapshot {
  name: string;
  phone: string;
  avatarUrl?: string;
  categoryId?: string;
}

export interface BookingTimelineItem {
  status: string;
  timestamp: string;
  changedBy: string;
  reason?: string;
}

export interface ExtraChargeDto {
  id: string;
  title: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
}
 
export interface AdminBookingListDto {
  id: string;
  status: BookingStatus;
  pricing: {
    estimated: number;
    final?: number;
  };
  location: {
    address: string;
    coordinates?: { lat: number; lng: number };  
  };
  timestamps: {
    createdAt: string;
    updatedAt: string;
  };
  snapshots: {
    service: BookingSnapshot;
    customer: BookingSnapshot;
    technician?: BookingSnapshot;
  };
}
 
export interface AdminBookingDetailDto extends AdminBookingListDto {
  timeline: BookingTimelineItem[];
  extraCharges: ExtraChargeDto[];
  technicianId?: string;
  customerId: string;
}

export interface AdminBookingParams {
  page: number;
  limit: number;
  search?: string;
  status?: BookingStatus | BookingStatus[];
  zoneId?: string;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: "newest" | "oldest" | "updated";
}

export interface PaginatedAdminBookingResult {
  data: AdminBookingListDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TechnicianSearchResult {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  availabilityStatus: "AVAILABLE" | "BUSY" | "OFFLINE" | string;
  isOnline: boolean;
}
 

export const getAllBookings = async (params: AdminBookingParams): Promise<PaginatedAdminBookingResult> => {
  const queryParams = {
    ...params,
    startDate: params.startDate?.toISOString(),
    endDate: params.endDate?.toISOString()
  };

  const response = await api.get(ADMIN_BOOKING_ENDPOINTS.BOOKINGS, { params: queryParams });
  return response.data.data;  
};
 
export const getBookingDetails = async (id: string): Promise<AdminBookingDetailDto> => { 
  const response = await api.get(`${ADMIN_BOOKING_ENDPOINTS.BOOKINGS}/${id}`);
  return response.data.data;
};
export const forceAssignTechnician = async (bookingId: string, technicianId: string): Promise<void> => {
  await api.post(`${ADMIN_BOOKING_ENDPOINTS.BOOKINGS}/${bookingId}/assign`, { technicianId });
};

export const forceCancelBooking = async (bookingId: string, reason: string): Promise<void> => {
  await api.post(`${ADMIN_BOOKING_ENDPOINTS.BOOKINGS}/${bookingId}/status`, { 
    status: "CANCELLED",
    reason 
  });
};

export const forceCompleteBooking = async (bookingId: string): Promise<void> => {
  await api.post(`${ADMIN_BOOKING_ENDPOINTS.BOOKINGS}/${bookingId}/status`, { 
    status: "COMPLETED",
    reason: "Admin Force Complete" 
  });
};
export const forceStatusUpdate = async (
  bookingId: string, 
  status: string, 
  reason: string
): Promise<void> => {
  await api.post(`${ADMIN_BOOKING_ENDPOINTS.BOOKINGS}/${bookingId}/status`, { 
    status, 
    reason 
  });
};

export const searchTechnicians = async (query: string): Promise<TechnicianSearchResult[]> => {
  const response = await api.get("/admin/technicians", { 
      params: { 
        search: query, 
        status: "APPROVED", 
        limit: 10
      } 
  });
  return response.data.data; 
};