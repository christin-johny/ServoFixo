// src/shared/types/value-objects/BookingTypes.ts

export type BookingStatus = 
  | "REQUESTED" 
  | "ASSIGNED_PENDING" 
  | "ACCEPTED" 
  | "EN_ROUTE" 
  | "REACHED" 
  | "IN_PROGRESS" 
  | "EXTRAS_PENDING" 
  | "COMPLETED" 
  | "PAID" 
  | "CANCELLED" 
  | "FAILED_ASSIGNMENT"
  | "DISPUTED"
  | "CLOSED";

export type PaymentStatus = "PENDING" | "CAPTURED" | "FAILED" | "REFUNDED";

export interface BookingLocation {
  address: string;
  coordinates: { lat: number; lng: number };
  mapLink?: string; // Corresponds to locationLink in PDF
}

export interface BookingPricing {
  estimated: number;
  final?: number;
  deliveryFee: number;
  discount?: number;
  tax?: number;
}

export interface BookingPayment {
  status: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  amountPaid?: number;
}

export interface TechAssignmentAttempt {
  techId: string;
  attemptAt: Date;
  expiresAt: Date; // Keep this for individual attempt logic
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "TIMEOUT" | "BUSY" | "CANCELLED_BY_SYSTEM";
  adminForced?: boolean;
  rejectionReason?: string;
}

export interface ExtraCharge {
  id: string; // UUID
  title: string;
  amount: number;
  description?: string;
  proofUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  addedByTechId: string; // Required for audit
  addedAt: Date;
}

export interface BookingMeta {
  otp?: string;
  instructions?: string;
  aiSummaryUrl?: string;
}

export interface BookingTimelineEvent {
  status: BookingStatus;
  changedBy: string; // e.g., "customer", "tech:123", "system", "admin:999"
  timestamp: Date;
  reason?: string;
  meta?: any;
}

export interface BookingTimestamps {
  createdAt: Date;
  scheduledAt?: Date;
  updatedAt: Date;
  acceptedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
}