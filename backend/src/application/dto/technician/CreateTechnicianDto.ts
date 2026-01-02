export class CreateTechnicianDto {
  name!: string;
  email!: string;
  phone!: string;
  password!: string;
  
  // They might select these during onboarding, or update later
  categoryIds?: string[];
  zoneIds?: string[];
}