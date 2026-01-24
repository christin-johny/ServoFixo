
import { Booking } from "../entities/Booking";
import { IBaseRepository } from "./IBaseRepository";
import { BookingStatus, TechAssignmentAttempt,ExtraCharge } from "../../../../shared/types/value-objects/BookingTypes";

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

  // --- Write Operations (Core Logic) ---
  
  /**
   * Persists a new booking
   */
  create(booking: Booking): Promise<Booking>;

  /**
   * Updates just the status (and relevant timestamp)
   */
  updateStatus(id: string, status: BookingStatus): Promise<void>;

  /**
   * Pushes a new attempt to the history. 
   * Used by the Assignment Service loop.
   */
  addAssignmentAttempt(id: string, attempt: TechAssignmentAttempt): Promise<void>;

  /**
   * Atomically locks the booking for a technician.
   * MUST use DB transaction or atomic update to prevent double-booking.
   */
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

  /**
   * Updates an extra charge item (Approve/Reject)
   */
  updateExtraChargeStatus(bookingId: string, chargeId: string, status: "APPROVED" | "REJECTED"): Promise<void>;

  /**
   * Updates payment status after gateway callback
   */
  updatePaymentStatus(bookingId: string, status: "PAID" | "FAILED", transactionId?: string): Promise<void>;

  /**
   * Atomically pushes a new extra charge and updates status to EXTRAS_PENDING.
   * Prevents race conditions during billing updates.
   */
  addExtraCharge(bookingId: string, charge: ExtraCharge): Promise<void>;
}