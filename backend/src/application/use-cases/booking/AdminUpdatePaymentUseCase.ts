import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ILogger } from "../../interfaces/ILogger";
import { AdminUpdatePaymentDto } from "../../dto/admin/AdminUpdatePaymentDto";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { PaymentStatus } from "../../../../../shared/types/value-objects/BookingTypes"; 

export class AdminUpdatePaymentUseCase implements IUseCase<void, [AdminUpdatePaymentDto]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(input: AdminUpdatePaymentDto): Promise<void> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);

    const previousStatus = booking.getPayment().status;
 
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