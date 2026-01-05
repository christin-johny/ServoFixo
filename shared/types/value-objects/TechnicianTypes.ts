// Strict definitions for complex objects to avoid 'any'

export interface TechnicianDocument {
  name: string;        // e.g., "Aadhaar Card"
  fileUrl: string;     // S3 URL
  fileType: string;    // "image/jpeg"
  isVerified: boolean; // Admin approval status
  rejectionReason?: string;
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
  coordinates: [number, number]; // [longitude, latitude]
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
  currentBalance: number; // +ve: Platform owes Tech, -ve: Tech owes Platform
  frozenAmount: number;   
  currency: string;
}

export type VerificationStatus = 'PENDING' | "VERIFICATION_PENDING" | 'VERIFIED' | 'REJECTED';