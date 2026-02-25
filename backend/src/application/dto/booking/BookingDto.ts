import { BookingStatus } from "../../../domain/value-objects/BookingTypes";

export interface GetRecommendedTechniciansDto {
    zoneId: string;
    serviceId: string;
    search?: string;
}

export interface GetAllBookingsDto {
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

export interface GetCustomerBookingsDto {
    customerId: string;
    page: number;
    limit: number;
    status?: string;  
}

export interface GetTechnicianHistoryDto {
  technicianId: string;
  page: number;
  limit: number;  
  status?: string | BookingStatus | BookingStatus[]; 
  search?: string;
}

export interface AdminForceAssignDto {
    bookingId: string;
    technicianId: string;
    adminId: string;
}

export interface AdminForceStatusDto {
    bookingId: string;
    adminId: string;
    status: BookingStatus;
    reason: string;
}
