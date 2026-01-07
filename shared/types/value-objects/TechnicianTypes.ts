export type VerificationStatus =
  | "PENDING"
  | "VERIFICATION_PENDING"
  | "VERIFIED"
  | "REJECTED";

export type DocumentStatus = "PENDING" | "APPROVED" | "REJECTED"| "VERIFICATION_PENDING";

export interface TechnicianDocument {
  // changed 'name' to 'fileName' to match S3/Multer
  fileName: string;
  fileUrl: string;
  // changed 'fileType' to 'type' (e.g., AADHAAR, PAN)
  type: string; 
  // changed 'isVerified' to 'status' to handle Rejection
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
  coordinates: [number, number]; // [lng, lat]
  lastUpdated: Date;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface TechnicianAvailability {
  isOnline: boolean;
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