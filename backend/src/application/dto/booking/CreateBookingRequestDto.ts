// src/application/dto/booking/CreateBookingRequestDto.ts

export class CreateBookingRequestDto {
  customerId!: string; // Usually extracted from Token, but kept here for internal service use
  serviceId!: string;
  zoneId!: string;
  
  location!: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    mapLink?: string;
  };

  // Optional: User might want to schedule for later (Phase 2 feature)
  requestedTime?: Date; 

  meta?: {
    instructions?: string;
  };
}