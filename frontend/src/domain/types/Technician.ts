export type VerificationStatus =
  | "PENDING"
  | "VERIFICATION_PENDING"
  | "VERIFIED"
  | "REJECTED";

export interface TechnicianQueueItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  status: VerificationStatus;
  submittedAt: string; 
}

export interface PaginatedTechnicianQueue {
  data: TechnicianQueueItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TechnicianProfileFull {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;

  bio?: string; 
  experienceSummary: string;
  
  zoneIds: string[];
  zoneNames?: string[]; // Optional in case older data doesn't have it

  categoryIds: string[];
  categoryNames?: string[];

  subServiceIds: string[];
  subServiceNames?: string[];

  documents: {
    type: string;
    fileUrl: string;
    fileName: string;
    status: "PENDING" | "APPROVED" | "REJECTED" | "VERIFICATION_PENDING";
    rejectionReason?: string;
  }[];

  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };

  isSuspended: boolean;

  ratings: {
    averageRating: number;
    totalReviews: number;
  };

  walletBalance: {
    currentBalance: number;
    frozenAmount: number;
  };

  verificationStatus: VerificationStatus;
  submittedAt: string;
}