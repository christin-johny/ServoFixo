export class CreateTechnicianDto {
  name!: string;
  email!: string;
  phone!: string;
  password!: string;
   
  categoryIds?: string[];
  zoneIds?: string[];
}