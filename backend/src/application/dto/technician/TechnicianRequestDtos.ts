export interface RequestServiceAddInput {
  serviceId: string;
  categoryId: string;
  proofUrl?: string;
}

export interface RequestZoneTransferInput {
  currentZoneId: string;
  requestedZoneId: string;
}

export interface RequestBankUpdateInput {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  upiId?: string;
  proofUrl: string;
}