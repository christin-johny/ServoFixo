import { 
  VerificationStatus,
  ServiceRequest,
  ZoneRequest,
  BankUpdateRequest,
  PayoutStatus
} from "../../../../../shared/types/value-objects/TechnicianTypes";

export interface CategoryData { id: string; name: string; iconUrl?: string; }
export interface ServiceData { id: string; name: string; categoryId: string; }
export interface ZoneData { id: string; name: string; }

export interface TechnicianResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  bio?: string;

  onboardingStep: number;
  experienceSummary?: string;

  categoryIds: string[];
  subServiceIds: string[];
  zoneIds: string[];

  serviceRequests: ServiceRequest[];
  zoneRequests: ZoneRequest[];
  // ✅ NEW
  bankUpdateRequests: BankUpdateRequest[];
  payoutStatus: PayoutStatus;

  categories?: CategoryData[];
  subServices?: ServiceData[];
  serviceZones?: ZoneData[];

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
    isOnJob: boolean; // ✅ NEW
    lastSeen?: Date;
    schedule?: Array<{ day: string; startTime: string; endTime: string }>;
  };

  ratings: { averageRating: number; totalReviews: number; };
  verificationStatus: VerificationStatus;
  verificationReason?: string;
  isSuspended: boolean;
  suspendReason?: string;
  isDeleted?: boolean;
  portfolioUrls: string[];
  deviceToken?: string;
  currentLocation?: { type: "Point"; coordinates: number[]; lastUpdated: Date; };
  emergencyContact?: { name: string; phone: string; relation: string; };
  createdAt: Date;
  updatedAt: Date;
}