export class CreateBookingRequestDto {
  customerId!: string; 
  serviceId!: string;
  
  // Kept for backward compatibility, but we calculate it on server now
  zoneId!: string; 
  
  location!: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    mapLink?: string;
  };
 
  contact?: {
    name: string;
    phone: string;
  };

  requestedTime?: Date; 

  meta?: {
    instructions?: string;
  };
}