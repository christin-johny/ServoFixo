// src/application/interfaces/services/IZoneService.ts

export interface ServiceabilityResult {
  isServiceable: boolean;
  zoneId: string | null;
  zoneName?: string;
}

export interface IZoneService {
  checkServiceability(lat: number, lng: number): Promise<ServiceabilityResult>;
}