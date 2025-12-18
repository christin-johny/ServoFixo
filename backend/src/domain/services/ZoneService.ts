import { IZoneRepository } from "../repositories/IZoneRepository";

export interface ServiceabilityResult {
  isServiceable: boolean;
  zoneId: string | null;
  zoneName?: string;
}

export class ZoneService {
  constructor(private zoneRepository: IZoneRepository) {}

  async checkServiceability(lat: number, lng: number): Promise<ServiceabilityResult> {
    
    const zone = await this.zoneRepository.findZoneByCoordinates(lat, lng);

    if (zone) {
      return { 
        isServiceable: true, 
        zoneId: zone.getId(),
        zoneName: zone.getName()
      };
    }

    return { 
      isServiceable: false, 
      zoneId: null 
    };
  }
}