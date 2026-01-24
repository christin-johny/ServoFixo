export class RespondToBookingDto {
  bookingId!: string;
  technicianId!: string;
  response!: "ACCEPT" | "REJECT";
  reason?: string; 
}