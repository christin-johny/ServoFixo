import { PaymentStatus } from "../../../domain/value-objects/BookingTypes";

export class AdminUpdatePaymentDto {
  bookingId!: string;
  adminId!: string;
  status!: PaymentStatus;  
  transactionId?: string;  
}