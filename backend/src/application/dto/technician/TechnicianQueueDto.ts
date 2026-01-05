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
}

export interface PaginatedTechnicianQueueResponse {
  data: TechnicianQueueItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}