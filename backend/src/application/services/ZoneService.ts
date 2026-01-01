
import { IZoneRepository } from "../../domain/repositories/IZoneRepository"; 
import { IZoneService, ServiceabilityResult } from "../interfaces/IZoneService";
 
export class ZoneService implements IZoneService {
  constructor(private _zoneRepository: IZoneRepository) {}

  async checkServiceability(lat: number, lng: number): Promise<ServiceabilityResult> {
    
    const zone = await this._zoneRepository.findZoneByCoordinates(lat, lng);

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