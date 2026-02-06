export class AddExtraChargeDto {
  bookingId!: string;
  technicianId!: string;
  
  title!: string;        
  amount!: number;      
  description?: string;  
  proofUrl?: string;     
}