import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { INotificationService } from "../../services/INotificationService"; 
import { ILogger } from "../../interfaces/ILogger";
import { CancelBookingDto } from "../../dto/booking/CancelBookingDto";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class TechnicianCancelBookingUseCase implements IUseCase<void, [CancelBookingDto]> {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _notificationService: INotificationService,
    private readonly _logger: ILogger
  ) {}

  async execute(input: CancelBookingDto): Promise<void> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);

    if (booking.getTechnicianId() !== input.userId) {
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    // 1. Mark Current Tech as "CANCELLED_BY_TECH"
    // We treat this similar to a rejection, but with a specific reason/flag
    booking.rejectAssignment(input.userId, "CANCELLED_BY_TECH: " + input.reason);
    
    // Note: We intentionally DO NOT set the main status to CANCELLED.
    // The customer still wants the service!

    // 2. Find Replacement (Re-trigger Flow A Logic)
    const candidates = booking.getCandidateIds();
    const currentIndex = candidates.indexOf(input.userId);
    const nextCandidateId = candidates[currentIndex + 1];

    if (nextCandidateId) {
        // --- RETRY (Next Tech) ---
        booking.addAssignmentAttempt(nextCandidateId);
        await this._bookingRepo.update(booking);

        // Notify Next Tech
        const earnings = booking.getPricing().estimated; // Simplified
        await this._notificationService.sendBookingRequest(nextCandidateId, {
            bookingId: booking.getId(),
            serviceName: booking.getSnapshots()?.service?.name || "Service",
            earnings: earnings,
            distance: "Check Map",
            address: booking.getLocation().address,
            expiresAt: booking.getAssignmentExpiresAt()!
        });

        // Notify Customer (Re-assurance)
        await this._notificationService.send({
            recipientId: booking.getCustomerId(),
            recipientType: "CUSTOMER",
            type: "BOOKING_UPDATE" as any,
            title: "Technician Changed ⚠️",
            body: "Previous tech had an emergency. Finding a new one...",
            metadata: { bookingId: booking.getId() }
        });

    } else {
        // --- FAILURE (No one left) ---
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
    }

    // TODO: Penalize Technician (Call TechnicianRepository.decreaseRating(input.userId))

    this._logger.info(`Booking ${booking.getId()} cancelled by Tech ${input.userId}. Searching next...`);
  }
}