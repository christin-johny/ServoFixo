export class ZoneResponseDto {
  id!: string;
  name!: string;
  description!: string;
  boundaries!: { lat: number; lng: number }[];
  isActive!: boolean;
  createdAt!: string; 
  updatedAt!: string; 
}