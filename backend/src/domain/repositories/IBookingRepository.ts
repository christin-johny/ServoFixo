import { Booking } from "../entities/Booking";
import { IBaseRepository } from "./IBaseRepository";
import { BookingStatus, TechAssignmentAttempt, ExtraCharge, PaymentStatus } from "../value-objects/BookingTypes";
import { IDatabaseSession } from "../../application/interfaces/services/IDatabaseSession";

export interface BookingFilterParams {
  customerId?: string;
  technicianId?: string;
  zoneId?: string;
  search?:string;
  status?: BookingStatus | BookingStatus[];
  startDate?: Date;
  categoryId?:string;
  sortBy?:string;
  endDate?: Date;
}

export interface PaginatedBookingResult {
  data: Booking[]; 
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IBookingRepository extends IBaseRepository<Booking> {

  findAllPaginated(
    page: number, 
    limit: number, 
    filters: BookingFilterParams
  ): Promise<PaginatedBookingResult>;

  findActiveBookingForTechnician(technicianId: string): Promise<Booking | null>;
  findActiveBookingForCustomer(customerId: string): Promise<Booking | null>;
  hasOverlappingBooking(technicianId: string, requestedTime: Date, bufferHours: number): Promise<boolean>;
   
  findExpiredAssignments(): Promise<Booking[]>; // <--- ADDED THIS
 
  
  create(booking: Booking): Promise<Booking>;

  updateStatus(id: string, status: BookingStatus): Promise<void>;

  addAssignmentAttempt(id: string, attempt: TechAssignmentAttempt): Promise<void>;

  assignTechnician(
    bookingId: string, 
    technicianId: string, 
    techSnapshot: { 
      name: string; 
      phone: string; 
      avatarUrl?: string; 
      rating: number; 
    }
  ): Promise<boolean>;

  updateExtraChargeStatus(bookingId: string, chargeId: string, status: "APPROVED" | "REJECTED"): Promise<void>;

  updatePaymentStatus(bookingId: string, status: PaymentStatus, transactionId?: string): Promise<void>;

addExtraCharge(bookingId: string, charge: ExtraCharge): Promise<ExtraCharge>;

  findByPaymentOrderId(orderId: string): Promise<Booking | null>;

  markAsRated(bookingId: string): Promise<void>;

  findById(id: string, session?: IDatabaseSession): Promise<Booking | null>;
  update(booking: Booking, session?: IDatabaseSession): Promise<Booking>;

  updatePaymentStatus(id: string, status: PaymentStatus, transactionId?: string, session?: IDatabaseSession): Promise<void>;
  findByPaymentOrderId(orderId: string, session?: IDatabaseSession): Promise<Booking | null>;
  getAdminBookingStats(): Promise<{
    revenue: number;
    statusCounts: Record<string, number>;
  }>;
  getTechnicianEarnings(technicianId: string): Promise<number>;
}