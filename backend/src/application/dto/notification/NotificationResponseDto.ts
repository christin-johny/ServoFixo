import { 
  NotificationType, 
  NotificationStatus, 
  RecipientType, 
  NotificationPriority 
} from "../../../../../shared/types/value-objects/NotificationTypes";

export interface NotificationResponseDto {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  
  // UI Helpers
  icon?: string;
  imageUrl?: string;
  
  // Navigation & Payload
  clickAction?: string;
  metadata: Record<string, string>;
  
  // Metadata
  priority: NotificationPriority;
  status: NotificationStatus;
  readAt?: Date;
  createdAt: Date;
}