import { BookingStatus } from "../../../domain/value-objects/BookingTypes";  
export class UpdateJobStatusDto {
  bookingId!: string;
  technicianId!: string;
   
  status!: Extract<BookingStatus, "EN_ROUTE" | "REACHED" | "IN_PROGRESS">; 
   
  location?: {
    lat: number;
    lng: number;
  };
 
  otp?: string; 
}