import { CreateNotificationDto } from "../dto/notification/CreateNotificationDto";
import { NotificationResponseDto } from "../dto/notification/NotificationResponseDto";

export interface INotificationService {
  send(dto: CreateNotificationDto): Promise<NotificationResponseDto>;

  notifyRequestResolved(
    technicianId: string,
    data: {
      type: "SERVICE" | "ZONE" | "BANK";
      action: "APPROVE" | "REJECT";
      rejectionReason?: string;
      metadata: Record<string, string>;
    }
  ): Promise<void>;
  sendUrgentAlert(
    recipientId: string,
    title: string,
    body: string,
    metadata: Record<string, string>
  ): Promise<void>;
}
