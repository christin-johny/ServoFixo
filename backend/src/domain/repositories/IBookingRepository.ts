import { Booking } from "../entities/Booking";
import { IBaseRepository } from "./IBaseRepository";
import { BookingStatus, TechAssignmentAttempt, ExtraCharge, PaymentStatus } from "../../../../shared/types/value-objects/BookingTypes";

export interface BookingFilterParams {
  customerId?: string;
  technicianId?: string;
  zoneId?: string;
  status?: BookingStatus | BookingStatus[];
  startDate?: Date;
  endDate?: Date;
}

export interface PaginatedBookingResult {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
}

export interface IBookingRepository extends IBaseRepository<Booking> {

  findAllPaginated(
    page: number, 
    limit: number, 
    filters: BookingFilterParams
  ): Promise<PaginatedBookingResult>;

  findActiveBookingForTechnician(technicianId: string): Promise<Booking | null>;
  findActiveBookingForCustomer(customerId: string): Promise<Booking | null>;
  
  // --- Scheduler Queries ---
  
  /**
   * Finds bookings that are stuck in ASSIGNED_PENDING and have passed their expiration time.
   * Used by the Cron Job.
   */
  findExpiredAssignments(): Promise<Booking[]>; // <--- ADDED THIS

  // --- Write Operations (Core Logic) ---
  
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

  addExtraCharge(bookingId: string, charge: ExtraCharge): Promise<void>;
  findByPaymentOrderId(orderId: string): Promise<Booking | null>;
}