import {
  BookingStatus,
  BookingLocation,
  BookingPricing,
  BookingPayment,
  TechAssignmentAttempt,
  ExtraCharge,
  BookingMeta,
  BookingTimelineEvent, // Added
  BookingTimestamps
} from "../../../../../shared/types/value-objects/BookingTypes";

export interface BookingResponseDto {
  id: string;
  customerId: string;
  technicianId?: string | null;
  serviceId: string;
  zoneId: string;
  
  status: BookingStatus;
  
  location: BookingLocation;
  pricing: BookingPricing;
  payment: BookingPayment;
  
  // --- New Fields Added below ---
  candidateIds: string[]; 
  assignedTechAttempts: TechAssignmentAttempt[];
  extraCharges: ExtraCharge[];
  timeline: BookingTimelineEvent[]; // Critical for history display
  
  chatId?: string;
  // -----------------------------

  meta: BookingMeta;
  timestamps: BookingTimestamps;
}