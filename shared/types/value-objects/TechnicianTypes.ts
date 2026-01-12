export type VerificationStatus =
  | "PENDING"
  | "VERIFICATION_PENDING"
  | "VERIFIED"
  | "REJECTED";

export type DocumentStatus = "PENDING" | "APPROVED" | "REJECTED" | "VERIFICATION_PENDING";

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type ServiceRequestAction = "ADD" | "REMOVE";

export type PayoutStatus = "ACTIVE" | "ON_HOLD"; // ✅ NEW

export interface ServiceRequest {
  id: string;
  serviceId: string;
  categoryId: string; 
  action: ServiceRequestAction;
  proofUrl?: string; 
  status: RequestStatus;
  adminComments?: string;
  requestedAt: Date;
  resolvedAt?: Date;
}

export interface ZoneRequest {
  id: string;
  currentZoneId: string;
  requestedZoneId: string;
  status: RequestStatus;
  adminComments?: string;
  requestedAt: Date;
  resolvedAt?: Date;
}

// ✅ NEW: Bank Request Structure
export interface BankUpdateRequest {
  id: string;
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  upiId?: string;
  proofUrl: string; // Passbook Photo
  status: RequestStatus;
  adminComments?: string;
  requestedAt: Date;
  resolvedAt?: Date;
}

export interface TechnicianDocument {
  fileName: string;
  fileUrl: string;
  type: string;
  status: DocumentStatus;
  rejectionReason?: string;
  uploadedAt?: Date;
}

export interface TechnicianBankDetails {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  upiId?: string;
}

export interface TechnicianLocation {
  type: "Point";
  coordinates: [number, number]; 
  lastUpdated: Date;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface TechnicianAvailability {
  isOnline: boolean;
  isOnJob: boolean; // ✅ NEW: Working Status
  lastSeen?: Date;
  schedule?: { day: string; startTime: string; endTime: string }[];
}

export interface TechnicianRatings {
  averageRating: number;
  totalReviews: number;
}

export interface TechnicianWallet {
  currentBalance: number;
  frozenAmount: number;
  currency: string;
}

export interface TechnicianUpdatePayload {
  name?: string;
  email?: string;
  phone?: string;
  experienceSummary?: string;
}