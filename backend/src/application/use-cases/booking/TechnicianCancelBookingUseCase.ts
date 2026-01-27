import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { INotificationService } from "../../services/INotificationService"; 
import { ILogger } from "../../interfaces/ILogger";
import { CancelBookingDto } from "../../dto/booking/CancelBookingDto";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";

export class TechnicianCancelBookingUseCase implements IUseCase<void, [CancelBookingDto]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _notificationService: INotificationService,
    private readonly _logger: ILogger
  ) {}

  async execute(input: CancelBookingDto): Promise<void> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);
    if (booking.getTechnicianId() !== input.userId) {
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    this._logger.info(`[Cancel] Tech ${input.userId} cancelling active booking ${booking.getId()}`);

    await this._technicianRepo.updateAvailabilityStatus(input.userId, false);   
    try {
        booking.rejectAssignment(input.userId, "CANCELLED_BY_TECH: " + input.reason);
    } catch (e) { 
        this._logger.error(`[Cancel] Reject failed, possibly due to status mismatch: ${e}`);
        booking.setTechnicianId(null); // Force clear 
    }
 
    const candidates = booking.getCandidateIds() || [];  
    const currentIndex = candidates.indexOf(input.userId);
    const nextCandidateId = candidates[currentIndex + 1];

    if (nextCandidateId) { 
        const newExpiresAt = new Date(Date.now() + 45000);
         
        booking.addAssignmentAttempt(nextCandidateId); 
         
        await this._bookingRepo.update(booking);

        const pricing = booking.getPricing();
        const earnings = pricing ? pricing.estimated : 0;  
 
        await this._notificationService.sendBookingRequest(nextCandidateId, {
            bookingId: booking.getId(),
            serviceName: booking.getSnapshots()?.service?.name || "Service",
            earnings: earnings,
            distance: "Check Map",
            address: booking.getLocation().address, 
            expiresAt: newExpiresAt 
        });
 
        await this._notificationService.send({
            recipientId: booking.getCustomerId(),
            recipientType: "CUSTOMER",
            type: "BOOKING_UPDATE" as any,
            title: "Technician Changed ⚠️",
            body: "Previous technician had an emergency. Searching for a new one...",
            metadata: { bookingId: booking.getId() }
        });

        this._logger.info(`[Cancel] Re-assigned to next candidate: ${nextCandidateId}`);

    } else { 
        booking.updateStatus("FAILED_ASSIGNMENT", "system", "Tech cancelled & no replacements");
        await this._bookingRepo.update(booking);

        await this._notificationService.send({
            recipientId: booking.getCustomerId(),
            recipientType: "CUSTOMER",
            type: "BOOKING_FAILED" as any,
            title: "Booking Failed",
            body: "Technician cancelled and no other partners are available.",
            metadata: { bookingId: booking.getId() }
        });

        this._logger.warn(`[Cancel] No candidates left for booking ${booking.getId()}`);
    }
  }
}