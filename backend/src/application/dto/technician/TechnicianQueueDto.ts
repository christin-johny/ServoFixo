export interface TechnicianQueueItemDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  zoneName?: string; 
  categoryName?: string; 
  status: string;
  submittedAt: Date; 
  isSuspended: boolean;

  // ✅ ADDED: Admin Dashboard Indicators
  hasPendingServiceRequests: boolean;
  hasPendingZoneRequests: boolean;
  hasPendingBankRequests: boolean;
}

export interface PaginatedTechnicianQueueResponse {
  data: TechnicianQueueItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}