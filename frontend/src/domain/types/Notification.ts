export type RecipientType = "TECHNICIAN" | "CUSTOMER" | "ADMIN";

export type NotificationStatus = "UNREAD" | "READ" | "ARCHIVED";

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export enum NotificationType {
  SERVICE_REQUEST_APPROVED = "SERVICE_REQUEST_APPROVED",
  SERVICE_REQUEST_REJECTED = "SERVICE_REQUEST_REJECTED",
  BANK_UPDATE_APPROVED = "BANK_UPDATE_APPROVED",
  BANK_UPDATE_REJECTED = "BANK_UPDATE_REJECTED",
  ZONE_REQUEST_APPROVED = "ZONE_REQUEST_APPROVED",
  ZONE_REQUEST_REJECTED = "ZONE_REQUEST_REJECTED",
  ACCOUNT_VERIFIED = "ACCOUNT_VERIFIED",
  ACCOUNT_SUSPENDED = "ACCOUNT_SUSPENDED",
  NEW_BOOKING_ALERT = "NEW_BOOKING_ALERT",
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  imageUrl?: string;
  clickAction?: string;
  metadata: Record<string, string>;
  priority: NotificationPriority;
  status: NotificationStatus;
  readAt?: string;
  createdAt: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}