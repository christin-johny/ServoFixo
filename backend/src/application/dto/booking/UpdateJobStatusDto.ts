import { BookingStatus } from "../../../../../shared/types/value-objects/BookingTypes"; 
// Ensure your BookingTypes has the updated enum you just shared

export class UpdateJobStatusDto {
  bookingId!: string;
  technicianId!: string;
  
  // Restricted to the execution phase statuses
  status!: Extract<BookingStatus, "EN_ROUTE" | "REACHED" | "IN_PROGRESS">; 
  
  // Optional location update when changing status
  location?: {
    lat: number;
    lng: number;
  };

  // Optional OTP for starting the job (future proofing)
  otp?: string; 
}