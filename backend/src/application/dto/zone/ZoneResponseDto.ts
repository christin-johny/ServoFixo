export class ZoneResponseDto {
  id!: string;
  name!: string;
  description!: string;
  boundaries!: { lat: number; lng: number }[];
  isActive!: boolean;
  createdAt!: string; 
  updatedAt!: string; 
}

export interface PaginatedZonesResponse {
  zones: ZoneResponseDto[];
  total: number;
  currentPage: number;
  totalPages: number;
}