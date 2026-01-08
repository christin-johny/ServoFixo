export interface TechnicianProfileStatusDto {
  id: string;
  onboardingStep: number;
  verificationStatus: "PENDING" | "VERIFICATION_PENDING" | "VERIFIED" | "REJECTED";
  globalRejectionReason?: string;  
  availability: {
    isOnline: boolean;
  };
  personalDetails: {
    name: string;
    email: string;
    phone: string;
    avatarUrl?: string;
    bio?: string;
    experienceSummary?: string;
  }; 
  documents: {
    type: string;
    status: string;
    rejectionReason?: string;
    fileUrl: string;
    fileName: string;
  }[];
}