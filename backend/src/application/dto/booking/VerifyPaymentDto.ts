export interface VerifyPaymentDto {
  bookingId: string;
  orderId: string;
  paymentId: string;
  signature: string;
}