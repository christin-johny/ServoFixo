// src/domain/entities/Notification.ts

export type RecipientType = "TECHNICIAN" | "CUSTOMER" | "ADMIN";

export type NotificationStatus = "UNREAD" | "READ" | "ARCHIVED";

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export enum NotificationType {
  // Skill & Request Related
  SERVICE_REQUEST_APPROVED = "SERVICE_REQUEST_APPROVED",
  SERVICE_REQUEST_REJECTED = "SERVICE_REQUEST_REJECTED",
  
  // Financial Related
  BANK_UPDATE_APPROVED = "BANK_UPDATE_APPROVED",
  BANK_UPDATE_REJECTED = "BANK_UPDATE_REJECTED",
  PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
  
  // Logistics Related
  ZONE_REQUEST_APPROVED = "ZONE_REQUEST_APPROVED",
  ZONE_REQUEST_REJECTED = "ZONE_REQUEST_REJECTED",
  
  // Booking Related (Future Proof)
  NEW_BOOKING_ALERT = "NEW_BOOKING_ALERT",
  BOOKING_CANCELLED = "BOOKING_CANCELLED",
  
  // Account Related
  ACCOUNT_VERIFIED = "ACCOUNT_VERIFIED",
  ACCOUNT_SUSPENDED = "ACCOUNT_SUSPENDED"
}