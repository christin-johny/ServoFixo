export class RespondToExtraChargeDto {
  bookingId!: string;
  customerId!: string;
  chargeId!: string;
  response!: "APPROVE" | "REJECT";
}
