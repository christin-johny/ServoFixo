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
export interface IdNamePair {
  id: string;
  name: string;
}

export interface TechnicianProfileFull {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  status: VerificationStatus;
  bio?: string;
  experienceSummary: string;

  zoneIds: string[];

  categoryIds: string[];

  subServiceIds: string[];
  zoneNames: IdNamePair[];
  categoryNames: IdNamePair[];
  subServiceNames: IdNamePair[];

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
