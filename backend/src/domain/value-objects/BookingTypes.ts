 
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

export type PaymentStatus = "PENDING" | "CAPTURED" | "FAILED" | "REFUNDED"|"PAID";

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
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "TIMEOUT" | "BUSY" | "CANCELLED_BY_SYSTEM" | "CANCELLED_BY_TECH";
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
  changedBy: string;  
  timestamp: Date;
  reason?: string;
  meta?: Record<string, unknown>; 
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

export interface BookingSnapshots {
  technician?: {
    name: string;
    phone: string;
    avatarUrl?: string; // Matches Tech Model
    rating: number;
  };
  customer: {
    name: string;
    phone: string;
    avatarUrl?: string;
  };
  service: {
    name: string;
    categoryId: string;
  };
}