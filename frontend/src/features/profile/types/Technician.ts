export type VerificationStatus =
  | "PENDING"
  | "VERIFICATION_PENDING"
  | "VERIFIED"
  | "REJECTED";

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
    status: "PENDING" | "APPROVED" | "REJECTED" ;
    rejectionReason?: string;
  }[];

  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    upiId?: string;
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
 
  serviceRequests: Array<{
    id: string;  
    serviceId: string;
    categoryId: string;
    action: "ADD" | "REMOVE";
    status: "PENDING" | "APPROVED" | "REJECTED";
    requestedAt: string;
    isDismissed: boolean;  
    isArchived: boolean;   
  }>;
 
  zoneRequests: Array<{
    id: string;  
    currentZoneId: string;
    requestedZoneId: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    requestedAt: string;
    isDismissed: boolean;  
    isArchived: boolean;   
  }>;

  bankUpdateRequests: Array<{
    id: string; 
    accountHolderName: string;  
    accountNumber: string;      
    bankName: string;           
    ifscCode: string;           
    upiId?: string;
    proofUrl: string;           
    status: "PENDING" | "APPROVED" | "REJECTED";
    requestedAt: string;
    isDismissed: boolean;
    isArchived: boolean;
  }>;

  payoutStatus: "ACTIVE" | "ON_HOLD";
}