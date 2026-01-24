import type {
  ServiceRequest,
  ZoneRequest,
  BankUpdateRequest,
} from "./TechnicianRequestTypes";
import type { PayoutStatus } from "../../../../shared/types/value-objects/TechnicianTypes";

export interface IdNamePair {
  id: string;
  name: string;
}

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

  zoneNames: IdNamePair[];
  categoryNames: IdNamePair[];
  subServiceNames: IdNamePair[];

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
    upiId?: string;
  };

  verificationStatus: string;
  submittedAt: Date | string; //   Fixed: Accepts string
}

export interface ResolvePartnerRequestDto {
  requestType: "SERVICE" | "ZONE" | "BANK";
  requestId: string;
  action: "APPROVE" | "REJECT";
  rejectionReason?: string;
}
