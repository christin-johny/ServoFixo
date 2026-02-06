import { PaymentStatus } from "../../../../../shared/types/value-objects/BookingTypes";

export class AdminUpdatePaymentDto {
  bookingId!: string;
  adminId!: string;
  status!: PaymentStatus;  
  transactionId?: string;  
}