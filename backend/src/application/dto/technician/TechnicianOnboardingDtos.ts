export interface OnboardingStep1Dto {
  step: 1;
  technicianId: string;
  avatarUrl?: string;
  bio: string;
  experienceSummary: string;
}

export interface OnboardingStep2Dto {
  step: 2;
  technicianId: string;
  categoryIds: string[];
  subServiceIds: string[];
}

export interface OnboardingStep3Dto {
  step: 3;
  technicianId: string;
  zoneIds: string[];
}

export interface OnboardingStep4Dto {
  step: 4;
  technicianId: string;
  agreedToRates: boolean;
}

export interface TechnicianDocumentDto {
  type: "AADHAAR" | "PAN" | "DRIVING_LICENSE" | "CERTIFICATE" | "OTHER";
  fileUrl: string;
  fileName: string;
}

export interface OnboardingStep5Dto {
  step: 5;
  technicianId: string;
  documents: TechnicianDocumentDto[];
}

export interface OnboardingStep6Dto {
  step: 6;
  technicianId: string;
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}

export type TechnicianOnboardingInput =
  | OnboardingStep1Dto
  | OnboardingStep2Dto
  | OnboardingStep3Dto
  | OnboardingStep4Dto
  | OnboardingStep5Dto
  | OnboardingStep6Dto;
