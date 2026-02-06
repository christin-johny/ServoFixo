export class CancelBookingDto {
  bookingId!: string;
  userId!: string; // Customer or Technician ID
  reason?: string;
}