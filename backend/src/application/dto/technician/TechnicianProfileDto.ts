export interface RateCardItem {
  serviceId: string;
  name: string;
  basePrice: number;
  platformFee: number;
  technicianShare: number;
  commissionPercentage: number;
}

export interface RequestBankUpdateInput {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  upiId?: string;
  proofUrl: string;
}

export interface RequestServiceAddInput {
  serviceId: string;
  categoryId: string;
  proofUrl?: string; 
  action: "ADD" | "REMOVE"; 
  isDismissed?: boolean; 
  isArchived?: boolean;  
}

export interface RequestZoneTransferInput {
  currentZoneId: string;
  requestedZoneId: string;
}

export interface ToggleStatusInput {
  technicianId: string;
  lat?: number;
  lng?: number;
}

export interface UploadTechnicianFileInput {
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  folder: "avatars" | "documents";
}

export interface ToggleStatusInput {
  technicianId: string;
  lat?: number;
  lng?: number;
}

export interface UploadTechnicianFileInput {
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  folder: "avatars" | "documents";
}