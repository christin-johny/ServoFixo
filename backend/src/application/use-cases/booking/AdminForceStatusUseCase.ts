import { IUseCase } from "../../interfaces/IUseCase";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { ILogger } from "../../interfaces/ILogger";
import { BookingStatus } from "../../../../../shared/types/value-objects/BookingTypes";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class AdminForceStatusDto {
    bookingId!: string;
    adminId!: string;
    status!: BookingStatus;
    reason!: string;
}

export class AdminForceStatusUseCase implements IUseCase<void, [AdminForceStatusDto]> {
    constructor(
        private readonly _bookingRepo: IBookingRepository,
        private readonly _techRepo: ITechnicianRepository, // <--- Added Dependency
        private readonly _logger: ILogger
    ) {}

    async execute(input: AdminForceStatusDto): Promise<void> {
        const booking = await this._bookingRepo.findById(input.bookingId);
        if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);

        const previousStatus = booking.getStatus();
        const techId = booking.getTechnicianId();

        // 1. Force the Status Update (Domain Logic)
        // This handles timestamps and timeline logging
        booking.adminForceStatus(input.status, input.adminId, input.reason);

        // 2. Persist Booking Changes
        await this._bookingRepo.update(booking);

        // 3. Sync Technician Availability (Side Effects)
        // If the status changed significantly, we must ensure the tech is Locked/Released correctly.
        if (techId) {
           await this.syncTechnicianAvailability(techId, input.status);
        }

        this._logger.info(
            `Admin ${input.adminId} forced status change: ${previousStatus} -> ${input.status} for Booking ${input.bookingId}`
        );
    }

    /**
     * Automatically locks or unlocks the technician based on the forced status.
     * This prevents a tech from being "stuck" if an admin cancels a job,
     * or "free" if an admin forces a job back to progress.
     */
    private async syncTechnicianAvailability(techId: string, status: BookingStatus) {
        // Statuses that imply the tech is WORKING (Locked)
        const busyStatuses: BookingStatus[] = [
            "ACCEPTED", 
            "EN_ROUTE", 
            "REACHED", 
            "IN_PROGRESS", 
            "EXTRAS_PENDING"
        ];

        // Statuses that imply the tech is FREE (Released)
        const freeStatuses: BookingStatus[] = [
            "COMPLETED", 
            "PAID", 
            "CANCELLED", 
            "FAILED_ASSIGNMENT", 
            "REQUESTED", 
            "ASSIGNED_PENDING"
        ];

        if (busyStatuses.includes(status)) {
            await this._techRepo.updateAvailabilityStatus(techId, true); // Lock
            this._logger.info(`Technician ${techId} marked BUSY due to forced status ${status}`);
        } else if (freeStatuses.includes(status)) {
            await this._techRepo.updateAvailabilityStatus(techId, false); // Release
            this._logger.info(`Technician ${techId} marked AVAILABLE due to forced status ${status}`);
        }
    }
}