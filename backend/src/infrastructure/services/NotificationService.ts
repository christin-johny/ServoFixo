import { INotificationService } from "../../application/services/INotificationService";
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { Notification } from "../../domain/entities/Notification";
import { NotificationMapper } from "../../application/mappers/NotificationMapper";
import { CreateNotificationDto } from "../../application/dto/notification/CreateNotificationDto";
import { NotificationResponseDto } from "../../application/dto/notification/NotificationResponseDto";
import { LogEvents } from "../../../../shared/constants/LogEvents";
import { NotificationType } from "../../../../shared/types/value-objects/NotificationTypes";
import { SocketServer } from "../socket/SocketServer";

export class NotificationService implements INotificationService {
  constructor(
    private readonly _notificationRepo: INotificationRepository,
    private readonly _logger: any 
  ) {}

  async send(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    this._logger.info(LogEvents.NOTIFICATION_CREATE_INIT, { recipientId: dto.recipientId });

    const notification = new Notification({
      recipientId: dto.recipientId,
      recipientType: dto.recipientType,
      type: dto.type,
      title: dto.title,
      body: dto.body,
      icon: dto.icon,
      clickAction: dto.clickAction,
      metadata: dto.metadata,
      priority: dto.priority || "MEDIUM",
      status: "UNREAD",
    });

    const savedNotification = await this._notificationRepo.create(notification);
    const responseDto = NotificationMapper.toResponse(savedNotification);

    try {
      const io = SocketServer.getInstance(); //
      io.to(dto.recipientId).emit("NOTIFICATION_RECEIVED", responseDto);
      
      this._logger.info(LogEvents.NOTIFICATION_SEND_SUCCESS, { recipientId: dto.recipientId });
    } catch (error) {
      this._logger.error(LogEvents.NOTIFICATION_SEND_FAILED, { error, recipientId: dto.recipientId });
    }

    return responseDto;
  }

  async notifyRequestResolved(
    technicianId: string,
    data: {
      type: "SERVICE" | "ZONE" | "BANK";
      action: "APPROVE" | "REJECT";
      rejectionReason?: string;
      metadata: Record<string, string>;
    }
  ): Promise<void> {
    const isApproved = data.action === "APPROVE";
    let title = isApproved ? "Request Approved  " : "Action Required ⚠️";
    let body = "";
 
    if (data.type === "SERVICE") { 
      const isRemoval = data.metadata.serviceAction === "REMOVE";
      const catRemoved = data.metadata.categoryRemoved === "true";

      if (isApproved) {
        body = isRemoval 
          ? `The service has been removed from your profile.${catRemoved ? " Note: The parent category was also deactivated as it has no active services." : ""}`
          : "Your new service has been approved and is now active.";
      } else {
        body = `Your request to ${isRemoval ? "remove" : "add"} a service was not approved. Reason: ${data.rejectionReason || 'Please check details.'}`;
      }
    }  
    else if (data.type === "ZONE") {
      body = isApproved
        ? "Your zone transfer request is successful. You will now receive bookings in your new area."
        : `Zone transfer rejected. Reason: ${data.rejectionReason || 'Please check details.'}`;
    } 
    else if (data.type === "BANK") {
      body = isApproved
        ? "Your bank details have been updated. Payouts are now active."
        : `Bank details update failed. Reason: ${data.rejectionReason || 'Please check details.'}. Your payouts may remain on hold.`;
    }

    await this.send({
      recipientId: technicianId,
      recipientType: "TECHNICIAN",
      type: this.getNotificationType(data.type, isApproved),
      title,
      body,
      metadata: data.metadata,
      clickAction: data.type === "BANK" ? "/technician/profile/payouts" : "/technician/profile/services",
      priority: isApproved ? "MEDIUM" : "HIGH"
    });
  }

  private getNotificationType(type: string, approved: boolean): NotificationType {
    if (type === "SERVICE") return approved ? NotificationType.SERVICE_REQUEST_APPROVED : NotificationType.SERVICE_REQUEST_REJECTED;
    if (type === "ZONE") return approved ? NotificationType.ZONE_REQUEST_APPROVED : NotificationType.ZONE_REQUEST_REJECTED;
    return approved ? NotificationType.BANK_UPDATE_APPROVED : NotificationType.BANK_UPDATE_REJECTED;
  }

  async sendUrgentAlert(recipientId: string, title: string, body: string, metadata: Record<string, string>): Promise<void> {
    await this.send({
      recipientId,
      recipientType: "TECHNICIAN",
      type: NotificationType.NEW_BOOKING_ALERT,
      title,
      body,
      metadata,
      priority: "URGENT"
    });
  }
  
async sendBookingRequest(
    technicianId: string, 
    payload: {
      bookingId: string;
      serviceName: string;
      earnings: number;
      distance: string;
      address: string;
      expiresAt: Date;
    }
  ): Promise<void> {
    try {
      const io = SocketServer.getInstance();
      
      // 1. Emit the critical Real-Time Event (Popup Trigger)
      io.to(technicianId).emit("booking:assign_request", payload);

      // 2. Create Persisted Notification
      await this.send({
        recipientId: technicianId,
        recipientType: "TECHNICIAN",
          
        type: NotificationType.BOOKING_REQUEST, 
        
        title: "New Job Request! 🚀",
        body: `New ${payload.serviceName} job nearby. Earn ₹${payload.earnings}.`,
        metadata: {
          bookingId: payload.bookingId,
          expiresAt: payload.expiresAt.toISOString()
        },
        clickAction: `/technician/bookings/${payload.bookingId}`,
        priority: "URGENT"
      });

      this._logger.info(`Booking Request Socket Event sent to ${technicianId}`);
    } catch (error) {
      this._logger.error(`Failed to send booking request socket to ${technicianId}`, error);
    }
  }
}
