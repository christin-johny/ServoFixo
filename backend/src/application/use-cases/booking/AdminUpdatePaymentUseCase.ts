 import { IBookingRepository } from "../../../domain/repositories/IBookingRepository"; 
import { AdminUpdatePaymentDto } from "../../dto/admin/AdminUpdatePaymentDto";
import { ErrorMessages } from "../../constants/ErrorMessages";
import { PaymentStatus } from "../../../domain/value-objects/BookingTypes"; 
import { IAdminUpdatePaymentUseCase } from "../../interfaces/use-cases/booking/IBookingUseCases";

export class AdminUpdatePaymentUseCase implements IAdminUpdatePaymentUseCase {
  constructor(
    private readonly _bookingRepo: IBookingRepository 
  ) {}

  async execute(input: AdminUpdatePaymentDto): Promise<void> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);
 
 
    let txnId = input.transactionId; 
    if (input.status === "PAID" as PaymentStatus && !txnId) { 
        txnId = `ADMIN_OVERRIDE_${input.adminId}_${Date.now()}`;
    }

    await this._bookingRepo.updatePaymentStatus(
        booking.getId(), 
        input.status, 
        txnId
    );


  }
}