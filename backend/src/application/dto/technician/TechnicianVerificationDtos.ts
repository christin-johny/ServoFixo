import { 
  ServiceRequest, 
  ZoneRequest, 
  BankUpdateRequest, 
  PayoutStatus 
} from "../../../../../shared/types/value-objects/TechnicianTypes";

export interface AdminTechnicianProfileDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  
  bio?: string;
  experienceSummary: string;
  
  zoneIds: string[]; 
  categoryIds: string[];
  subServiceIds: string[];

  // Resolved Names for UI
zoneNames: { id: string; name: string }[];
  categoryNames: { id: string; name: string }[];
  subServiceNames: { id: string; name: string }[];
   
  serviceRequests: ServiceRequest[];
  zoneRequests: ZoneRequest[];
  bankUpdateRequests: BankUpdateRequest[];
  payoutStatus: PayoutStatus;

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