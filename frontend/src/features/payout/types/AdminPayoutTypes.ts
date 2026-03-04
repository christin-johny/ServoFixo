export type PayoutStatus = "PENDING" | "PROCESSING" | "APPROVED" | "FAILED";

export interface AdminPayoutDto {
  weekEnding: string;
  id: string;
  technicianId: string;
  technicianName: string;
  technicianPhone: string;
  amount: number;
  status: PayoutStatus;
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  referenceId?: string; 
  createdAt: string;    
  processedAt?: string; 
}

export interface PayoutProcessPayload {
  action: "APPROVE" | "FLAG";
  referenceId: string;
  notes?: string;
}