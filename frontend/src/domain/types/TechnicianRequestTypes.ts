export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PayoutStatus = "ACTIVE" | "ON_HOLD";

export interface ServiceRequest {
  serviceId: string;
  categoryId: string;
  action: "ADD" | "REMOVE";
  proofUrl?: string;
  status: RequestStatus;
  adminComments?: string;
  requestedAt: string; // Serialized Date from API
}

export interface ZoneRequest {
  currentZoneId: string;
  requestedZoneId: string;
  status: RequestStatus;
  adminComments?: string;
  requestedAt: string;
}

export interface BankUpdateRequest {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  upiId?: string;
  proofUrl: string;
  status: RequestStatus;
  adminComments?: string;
  requestedAt: string;
}