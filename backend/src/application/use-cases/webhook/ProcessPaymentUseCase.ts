import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { ILogger } from "../../interfaces/ILogger";
import { ProcessPaymentDto } from "../../dto/webhook/ProcessPaymentDto";

// This class strictly implements the IUseCase interface
export class ProcessPaymentUseCase implements IUseCase<void, [ProcessPaymentDto]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(input: ProcessPaymentDto): Promise<void> {
    // 1. Find the booking
    const booking = await this._bookingRepo.findByPaymentOrderId(input.orderId);
    
    if (!booking) {
        this._logger.warn(`Webhook ignored: Booking not found for Order ID ${input.orderId}`);
        return;
    }

    // 2. Mark as Paid
    await this._bookingRepo.updatePaymentStatus(booking.getId(), "PAID", input.transactionId);

    // 3. Unlock the Technician
    const techId = booking.getTechnicianId();
    if (techId) {
        await this._technicianRepo.updateAvailabilityStatus(techId, false);
        this._logger.info(`Technician ${techId} released from job.`);
    }

    this._logger.info(`Booking ${booking.getId()} payment confirmed.`);
  }
}