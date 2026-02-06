export type RecipientType = "TECHNICIAN" | "CUSTOMER" | "ADMIN";

export type NotificationStatus = "UNREAD" | "READ" | "ARCHIVED";

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export enum NotificationType {
 // Service & Account
  SERVICE_REQUEST_APPROVED = "SERVICE_REQUEST_APPROVED",
  SERVICE_REQUEST_REJECTED = "SERVICE_REQUEST_REJECTED",
  // Financial Related
  BANK_UPDATE_APPROVED = "BANK_UPDATE_APPROVED",
  BANK_UPDATE_REJECTED = "BANK_UPDATE_REJECTED",
  PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
  // Logistics Related
  ZONE_REQUEST_APPROVED = "ZONE_REQUEST_APPROVED",
  ZONE_REQUEST_REJECTED = "ZONE_REQUEST_REJECTED",
  // Booking Related
  NEW_BOOKING_ALERT = "NEW_BOOKING_ALERT",
  BOOKING_REQUEST = "BOOKING_REQUEST",
  BOOKING_CONFIRMED = "BOOKING_CONFIRMED",
  BOOKING_STATUS_UPDATE = "BOOKING_STATUS_UPDATE",
  BOOKING_FAILED = "BOOKING_FAILED",
  BOOKING_CANCELLED = "BOOKING_CANCELLED",
  BOOKING_COMPLETED="BOOKING_COMPLETED",
  // Admin
  ADMIN_NEW_BOOKING = 'ADMIN_NEW_BOOKING',
  ADMIN_BOOKING_FAILED = 'ADMIN_BOOKING_FAILED',
  // Account
  ACCOUNT_VERIFIED = "ACCOUNT_VERIFIED",
  ACCOUNT_SUSPENDED = "ACCOUNT_SUSPENDED",
  // CRITICAL ADDITION FOR EXTRAS FLOW
  BOOKING_APPROVAL_REQUEST = 'BOOKING_APPROVAL_REQUEST' ,
  CHARGE_UPDATE = 'CHARGE_UPDATE',
  PAYMENT_REQUEST = "PAYMENT_REQUEST",
  JOB_COMPLETED = "JOB_COMPLETED",
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