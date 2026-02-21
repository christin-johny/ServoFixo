import { IBookingRepository } from "../../../domain/repositories/IBookingRepository";
import { INotificationService } from "../../services/INotificationService"; 
import { ILogger } from "../../interfaces/ILogger";
import { UpdateJobStatusDto } from "../../dto/booking/UpdateJobStatusDto";
import { ErrorMessages, NotificationMessages } from "../../constants/ErrorMessages";
import { BookingStatus } from "../../../domain/value-objects/BookingTypes";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { NotificationType } from "../../../domain/value-objects/NotificationTypes";

export class UpdateJobStatusUseCase {
  constructor(
    private readonly _bookingRepo: IBookingRepository,
    private readonly _notificationService: INotificationService,
    private readonly _logger: ILogger
  ) {}

  async execute(input: UpdateJobStatusDto): Promise<void> {
    const booking = await this._bookingRepo.findById(input.bookingId);
    if (!booking) throw new Error(ErrorMessages.BOOKING_NOT_FOUND);

    if (booking.getTechnicianId() !== input.technicianId) {
        throw new Error(ErrorMessages.UNAUTHORIZED);
    }

    const currentStatus = booking.getStatus();
    this.validateTransition(currentStatus, input.status);

    if (input.status === "IN_PROGRESS") {
        const requiredOtp = booking.getMeta().otp;
        
        if (requiredOtp && requiredOtp !== input.otp) {
            this._logger.warn(`${LogEvents.OTP_MISMATCH} for Booking ${booking.getId()}. Expected: ${requiredOtp}, Got: ${input.otp}`);
            throw new Error(ErrorMessages.OTP_INVALID_INPUT);
        }
    }

    booking.updateStatus(input.status, `tech:${input.technicianId}`, "Status update by technician");

    await this._bookingRepo.updateStatus(booking.getId(), input.status);

    await this.sendCustomerNotification(booking.getCustomerId(), input.status, booking.getId());

    await this._notificationService.send({
        recipientId: "ADMIN_BROADCAST_CHANNEL",
        recipientType: "ADMIN",
        type: "ADMIN_STATUS_UPDATE" as any,
        title: `${NotificationMessages.TITLE_ADMIN_UPDATE}${input.status}`,
        body: `Tech ${input.technicianId} is now ${input.status}`,
        metadata: { 
            bookingId: booking.getId(), 
            status: input.status,
            technicianId: input.technicianId
        }
    });

  }

  private validateTransition(current: BookingStatus, target: BookingStatus) {
      if (target === "EN_ROUTE" && current !== "ACCEPTED") {
          throw new Error(ErrorMessages.INVALID_TRANSITION_EN_ROUTE);
      }
      if (target === "REACHED" && current !== "EN_ROUTE") {
          throw new Error(ErrorMessages.INVALID_TRANSITION_REACHED);
      }
      if (target === "IN_PROGRESS" && current !== "REACHED") {
          throw new Error(ErrorMessages.INVALID_TRANSITION_START);
      }
  }

  private async sendCustomerNotification(
      customerId: string, 
      status: string, 
      bookingId: string
  ) {
      let title = "";
      let body = "";
      
      switch(status) {
          case "EN_ROUTE":
              title = NotificationMessages.TITLE_STATUS_EN_ROUTE;
              body = NotificationMessages.BODY_STATUS_EN_ROUTE;
              break;
          case "REACHED":
              title = NotificationMessages.TITLE_STATUS_REACHED;
              body = NotificationMessages.BODY_STATUS_REACHED;
              break;
          case "IN_PROGRESS":
              title = NotificationMessages.TITLE_STATUS_STARTED;
              body = NotificationMessages.BODY_STATUS_STARTED;
              break;
      }

      if (title) {
          await this._notificationService.send({
              recipientId: customerId,
              recipientType: "CUSTOMER",
              type: NotificationType.BOOKING_STATUS_UPDATE,
              title,
              body,
              metadata: { bookingId, status },
              clickAction: `/customer/bookings/${bookingId}`
          });
      }
  }
}