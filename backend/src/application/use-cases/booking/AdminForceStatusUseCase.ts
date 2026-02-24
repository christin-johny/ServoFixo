 
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { INotificationService } from "../../services/INotificationService";  
import { BookingStatus } from "../../../domain/value-objects/BookingTypes";
import { ErrorMessages } from "../../constants/ErrorMessages";
import { NotificationType } from "../../../domain/value-objects/NotificationTypes";
import { SocketServer } from "../../../infrastructure/socket/SocketServer";  
import { AdminForceStatusDto } from "../../dto/booking/BookingDto";
import { IAdminForceStatusUseCase } from "../../interfaces/use-cases/booking/IBookingUseCases";



export class AdminForceStatusUseCase implements IAdminForceStatusUseCase  {
    constructor(
        private readonly _bookingRepo: IBookingRepository,
        private readonly _techRepo: ITechnicianRepository,
        private readonly _notificationService: INotificationService
    ) {}

    async execute(input: AdminForceStatusDto): Promise<void> {
        const booking = await this._bookingRepo.findById(input.bookingId);
        if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);
 
        const techId = booking.getTechnicianId();
        const customerId = booking.getCustomerId();
 
        booking.adminForceStatus(input.status, input.adminId, input.reason);
 
        await this._bookingRepo.update(booking);
 
        if (techId) {
           await this.syncTechnicianAvailability(techId, input.status);
        }
 
        const io = SocketServer.getInstance();
        const payload = {
            bookingId: booking.getId(),
            status: input.status,
            updatedBy: "Admin",
            reason: input.reason
        };
 
        io.to(customerId).emit("booking:status_update", payload);
 
        if (techId) {
            io.to(techId).emit("booking:status_update", payload);
        }
 
        if (input.status === "CANCELLED") {
             io.to(customerId).emit("booking:cancelled", payload);
             if (techId) io.to(techId).emit("booking:cancelled", payload);
        } 
        else if (input.status === "COMPLETED") {
             io.to(customerId).emit("booking:completed", payload);
             if (techId) io.to(techId).emit("booking:completed", payload);
        }
 
        await this.sendPushNotifications(input, customerId, techId, booking.getId());

    }

    private async sendPushNotifications(
        input: AdminForceStatusDto, 
        customerId: string, 
        techId: string | null,
        bookingId: string
    ) { 
        if (input.status === "CANCELLED") { 
            await this._notificationService.send({
                recipientId: customerId,
                recipientType: "CUSTOMER",
                type: NotificationType.BOOKING_CANCELLED,
                title: "Booking Cancelled 🛑",
                body: `Admin cancelled booking #${bookingId.slice(-6)}. Reason: ${input.reason}`,
                metadata: { bookingId, status: "CANCELLED" }
            });
 
            if (techId) {
                await this._notificationService.send({
                    recipientId: techId,
                    recipientType: "TECHNICIAN",
                    type: NotificationType.BOOKING_CANCELLED,
                    title: "Job Cancelled by Admin ⚠️",
                    body: `The active job was cancelled by HQ. You are now free.`,
                    metadata: { bookingId, status: "CANCELLED" }
                });
            }
        }
 
        else if (input.status === "COMPLETED") { 
            await this._notificationService.send({
                recipientId: customerId,
                recipientType: "CUSTOMER",
                type: NotificationType.BOOKING_COMPLETED,
                title: "Job Marked Completed  ",
                body: "Technician has completed the work. Please check the invoice.",
                metadata: { bookingId, status: "COMPLETED" },
                clickAction: `/bookings/${bookingId}/payment`
            });
             
            if (techId) {
                await this._notificationService.send({
                     recipientId: techId,
                     recipientType: "TECHNICIAN",
                     type: NotificationType.BOOKING_COMPLETED,
                     title: "Job Completed (Admin) 🏁",
                     body: "This job was marked as completed by Admin.",
                     metadata: { bookingId, status: "COMPLETED" }
                });
            }
        }
 
        else {
             if (techId) {
                await this._notificationService.send({
                    recipientId: techId,
                    recipientType: "TECHNICIAN",
                    type: NotificationType.BOOKING_STATUS_UPDATE,
                    title: "Job Status Updated 🔄",
                    body: `Admin changed status to ${input.status.replace("_", " ")}`,
                    metadata: { bookingId, status: input.status }
                });
             }
        }
    }

    private async syncTechnicianAvailability(techId: string, status: BookingStatus) {
        const busyStatuses: BookingStatus[] = ["ACCEPTED", "EN_ROUTE", "REACHED", "IN_PROGRESS", "EXTRAS_PENDING"];
        const freeStatuses: BookingStatus[] = ["COMPLETED", "PAID", "CANCELLED", "FAILED_ASSIGNMENT", "REQUESTED", "ASSIGNED_PENDING"];

        if (busyStatuses.includes(status)) {
            await this._techRepo.updateAvailabilityStatus(techId, true);
        } else if (freeStatuses.includes(status)) {
            await this._techRepo.updateAvailabilityStatus(techId, false);
        }
    }
}