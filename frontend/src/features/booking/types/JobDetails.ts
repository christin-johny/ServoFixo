export interface JobDetails {
  id: string;
  status: string;
  service: { 
    name: string; 
    categoryId: string; 
  };
  customer: { 
    name: string; 
    phone: string; 
    avatarUrl?: string; 
  };
  location: { 
    address: string; 
    coordinates: { 
      lat: number; 
      lng: number; 
    }; 
  };
  pricing: { 
    estimated: number; 
  };
  snapshots: {
    customer: { 
      name: string; 
      phone: string; 
    };
    service: { 
      name: string; 
    };
  };
  meta?: { 
    instructions?: string; 
  };
}

export interface VerifyPaymentDto {
  bookingId: string;
  orderId: string;
  paymentId: string;
  signature: string;
}