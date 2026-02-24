

export interface UpdateTechnicianDto {
  name?: string;
  email?: string;
  phone?: string;
  experienceSummary?: string;
  
  // Operations
  zoneIds?: string[];
  categoryIds?: string[];
  subServiceIds?: string[];

  // Financials
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}

