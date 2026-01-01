export class CreateZoneDto {
  name!: string;
  description?: string;
  boundaries!: { lat: number; lng: number }[];
  isActive?: boolean;
}