import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { INotificationService } from "../../services/INotificationService"; 
import { ILogger } from "../../interfaces/ILogger";
import { UpdateJobStatusDto } from "../../dto/booking/UpdateJobStatusDto";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { NotificationType } from "../../../../../shared/types/value-objects/NotificationTypes";
import { BookingStatus } from "../../../../../shared/types/value-objects/BookingTypes";

export class UpdateJobStatusUseCase {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _notificationService: INotificationService,
    private readonly _logger: ILogger
  ) {}

  async execute(input: UpdateJobStatusDto): Promise<void> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);

    // 1. Validation: Authorization
    if (booking.getTechnicianId() !== input.technicianId) {
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    // 2. Validation: Strict State Machine
    // Prevents jumping steps (e.g., ACCEPTED -> IN_PROGRESS directly)
    const currentStatus = booking.getStatus();
    this.validateTransition(currentStatus, input.status);

    // 3. Update Status in Entity (Logic)
    // This updates the status and sets the timestamps (startedAt, etc.)
    booking.updateStatus(input.status, `tech:${input.technicianId}`, "Status update by technician");

    // 4. Persist to DB
    await this._bookingRepo.updateStatus(booking.getId(), input.status);

    // 5. Notify Customer
    await this.sendCustomerNotification(booking.getCustomerId(), input.status, booking.getId());

    this._logger.info(`Booking ${booking.getId()} moved to ${input.status}`);
  }

  private validateTransition(current: BookingStatus, target: BookingStatus) {
      if (target === "EN_ROUTE" && current !== "ACCEPTED") {
          throw new Error("Cannot mark En Route. Booking must be ACCEPTED first.");
      }
      if (target === "REACHED" && current !== "EN_ROUTE") {
          throw new Error("Cannot mark Reached. Technician must be EN_ROUTE first.");
      }
      if (target === "IN_PROGRESS" && current !== "REACHED") {
          throw new Error("Cannot start job. Technician must be at location (REACHED) first.");
      }
  }

  private async sendCustomerNotification(
      customerId: string, 
      status: string, 
      bookingId: string
  ) {
      let title = "";
      let body = "";
      // Using generic type string for 'type' to avoid Enum import conflicts if not updated yet
      const notifType = "BOOKING_STATUS_UPDATE" as any; 

      switch(status) {
          case "EN_ROUTE":
              title = "Technician is on the way! 🚚";
              body = "Track their live location in the app.";
              break;
          case "REACHED":
              title = "Technician has arrived! 📍";
              body = "Please meet the technician at your doorstep.";
              break;
          case "IN_PROGRESS":
              title = "Job Started 🛠️";
              body = "Work has begun. Please keep the OTP handy if requested.";
              break;
      }

      if (title) {
          await this._notificationService.send({
              recipientId: customerId,
              recipientType: "CUSTOMER",
              type: notifType,
              title,
              body,
              metadata: { bookingId, status },
              clickAction: `/customer/bookings/${bookingId}`
          });
      }
  }
}