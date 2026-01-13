export interface TechnicianQueueItemDto { 
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  status: string; // or VerificationStatus
  isSuspended: boolean;
  submittedAt: Date | string; 
 
  hasPendingServiceRequests: boolean;
  hasPendingZoneRequests: boolean;
  hasPendingBankRequests: boolean; 
  experienceSummary?: string;
  zoneName?: string;
}

export interface PaginatedTechnicianQueueResponse {
  data: TechnicianQueueItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}