import { 
  NotificationType, 
  RecipientType, 
  NotificationPriority 
} from "../../../domain/value-objects/NotificationTypes";

export interface CreateNotificationDto {
  recipientId: string;
  recipientType: RecipientType;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  clickAction?: string;
  metadata?: Record<string, string>;
  priority?: NotificationPriority;
}