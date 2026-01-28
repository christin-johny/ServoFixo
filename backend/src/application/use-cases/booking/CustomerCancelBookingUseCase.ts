import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository"; 
import { INotificationService } from "../../services/INotificationService"; 
import { ILogger } from "../../interfaces/ILogger";
import { CancelBookingDto } from "../../dto/booking/CancelBookingDto";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { NotificationType } from "../../../../../shared/types/value-objects/NotificationTypes";

export class CustomerCancelBookingUseCase implements IUseCase<void, [CancelBookingDto]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _notificationService: INotificationService,
    private readonly _logger: ILogger
  ) {}

  async execute(input: CancelBookingDto): Promise<void> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);

    if (booking.getCustomerId() !== input.userId) {
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    const currentStatus = booking.getStatus();

    if (['REACHED', 'IN_PROGRESS', 'EXTRAS_PENDING', 'COMPLETED', 'PAID', 'CANCELLED'].includes(currentStatus)) {
        throw new Error("Cancellation is not allowed at this stage.");
    }

    // ✅ FIX: HANDLE "WAITING SCREEN" (Request Withdrawn)
    // When status is ASSIGNED_PENDING, 'technicianId' is null. 
    // We must find the tech from the 'attempts' array.
    if (currentStatus === "ASSIGNED_PENDING") {
        const pendingAttempt = booking.getAttempts().find(a => a.status === "PENDING");
        
        if (pendingAttempt) {
            console.log(`[Cancel] Withdrawing request from Tech: ${pendingAttempt.techId}`);
            
            // 1. Notify the candidate tech to CLOSE their modal instantly
            await this._notificationService.send({
                recipientId: pendingAttempt.techId,
                recipientType: "TECHNICIAN",
                type: NotificationType.BOOKING_CANCELLED, // Use Enum
                title: "Request Withdrawn",
                body: "Customer cancelled the request.",
                metadata: { bookingId: booking.getId() }
            });

            // 2. Mark the attempt as Cancelled so it doesn't expire later
            // (Optional, depends on your Entity logic, but good practice)
            // booking.cancelAttempt(pendingAttempt.techId);
        }
    }

    // --- SCENARIO 2: Cancellation while En Route (Technician Assigned) ---
    const assignedTechId = booking.getTechnicianId();
    
    // Update Status in DB
    booking.updateStatus("CANCELLED", `customer:${input.userId}`, input.reason);
    await this._bookingRepo.update(booking);

    if (assignedTechId) {
        // Release the technician (isBusy = false)
        await this._technicianRepo.updateAvailabilityStatus(assignedTechId, false);

        // Notify Technician (Redirects them to Home)
        await this._notificationService.send({
            recipientId: assignedTechId,
            recipientType: "TECHNICIAN",
            type: NotificationType.BOOKING_CANCELLED,
            title: "Job Cancelled",
            body: "Customer cancelled the booking. You are now free.",
            metadata: { bookingId: booking.getId() }
        });
    }

    this._logger.info(`Booking ${booking.getId()} cancelled by customer.`);
  }
}