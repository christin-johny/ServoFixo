import {
  TechnicianBankDetails,
  EmergencyContact,
  TechnicianAvailability
} from "../../../domain/value-objects/TechnicianTypes";

export class UpdateTechnicianDto {
  name?: string;
  avatarUrl?: string;
  bio?: string;
  experienceSummary?: string;

  categoryIds?: string[];
  subServiceIds?: string[];
  zoneIds?: string[];

  bankDetails?: TechnicianBankDetails;
  availability?: TechnicianAvailability;  
  
  portfolioUrls?: string[];
  deviceToken?: string;
  emergencyContact?: EmergencyContact;
}