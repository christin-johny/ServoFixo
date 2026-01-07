export interface AdminTechnicianProfileDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  
  bio?: string; // ✅ Added Bio
  experienceSummary: string;
  
  zoneIds: string[]; 
  categoryIds: string[];
  subServiceIds: string[];

  // ✅ ADDED: Resolved Names for UI
  zoneNames: string[];
  categoryNames: string[];
  subServiceNames: string[];
  
  documents: {
    type: string;
    fileUrl: string;
    fileName: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    rejectionReason?: string;
  }[];
  
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };

  verificationStatus: string;
  submittedAt: Date;
}

export interface DocumentDecision {
  type: string; 
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string; 
}

export interface VerifyTechnicianDto {
  action: "APPROVE" | "REJECT";
  documentDecisions?: DocumentDecision[]; 
  globalRejectionReason?: string; 
}