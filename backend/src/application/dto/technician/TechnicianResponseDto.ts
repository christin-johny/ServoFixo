import { VerificationStatus } from "../../../../../shared/types/value-objects/TechnicianTypes";

export interface TechnicianResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  bio?: string;
  
  // ✅ New Fields
  onboardingStep: number;
  experienceSummary?: string;

  categoryIds: string[];
  subServiceIds: string[];
  zoneIds: string[];

  documents: Array<{
    type: string;
    fileUrl: string;
    fileName: string;
    status: string;
    rejectionReason?: string;
    uploadedAt: Date;
  }>;

  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    upiId?: string;
  };

  walletBalance: {
    currentBalance: number;
    frozenAmount: number;
    currency: string;
  };

  availability: {
    isOnline: boolean;
    lastSeen?: Date;
    schedule?: Array<{ day: string; startTime: string; endTime: string }>;
  };

  ratings: {
    averageRating: number;
    totalReviews: number;
  };

  // ✅ Use the Enum here
  verificationStatus: VerificationStatus;
  verificationReason?: string;
  isSuspended: boolean;
  suspendReason?: string;

  portfolioUrls: string[];
  deviceToken?: string;
  
  currentLocation?: {
    type: "Point";
    coordinates: number[];
    lastUpdated: Date;
  };

  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };

  createdAt: Date;
  updatedAt: Date;
}