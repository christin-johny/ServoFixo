import {
  TechnicianDocument,
  TechnicianBankDetails,
  TechnicianLocation,
  EmergencyContact,
  TechnicianAvailability,
  TechnicianRatings,
  TechnicianWallet,
  VerificationStatus,
} from "../../../../../shared/types/value-objects/TechnicianTypes";

export class TechnicianResponseDto {
  id!: string;
  name!: string;
  email!: string;
  phone!: string;
  // No Password here!
  
  avatarUrl?: string;
  bio?: string;
  experienceSummary?: string;

  // Professional
  categoryIds!: string[];
  subServiceIds!: string[];
  zoneIds!: string[];

  // Complex Objects
  documents!: TechnicianDocument[];
  bankDetails?: TechnicianBankDetails;
  walletBalance!: TechnicianWallet;
  availability!: TechnicianAvailability;
  ratings!: TechnicianRatings;

  // Status
  verificationStatus!: VerificationStatus;
  verificationReason?: string;
  isSuspended!: boolean;
  suspendReason?: string;

  // Extra
  portfolioUrls!: string[];
  deviceToken?: string;
  currentLocation?: TechnicianLocation;
  emergencyContact?: EmergencyContact;

  createdAt!: Date;
  updatedAt!: Date;
}