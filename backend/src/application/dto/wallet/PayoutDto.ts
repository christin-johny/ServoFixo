export interface PayoutResponseDto {
  id: string;
  technicianId: string;
  technicianName: string;
  amount: number;
  status: string;
  weekEnding: Date;
  bankDetails: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
}

export interface PayoutBatchResultDto {
  processedCount: number;
  totalAmount: number;
}