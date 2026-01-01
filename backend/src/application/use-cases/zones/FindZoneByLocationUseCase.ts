import { ZoneService } from "../../services/ZoneService";
import { ZoneServiceabilityDto } from "../../dto/zone/ZoneServiceabilityDto";

export class FindZoneByLocationUseCase {
  constructor(private readonly _zoneService: ZoneService) {}

  // Returns a DTO, not a raw service result
  async execute(lat: number, lng: number): Promise<ZoneServiceabilityDto> {
    const result = await this._zoneService.checkServiceability(lat, lng);
    
    return {
      isServiceable: result.isServiceable,
      zoneId: result.zoneId || undefined,
      zoneName: result.zoneName || undefined,
      message: result.isServiceable ? "Location is serviceable" : "Outside service area"
    };
  }
}