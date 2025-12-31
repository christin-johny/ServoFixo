import { ZoneService, ServiceabilityResult } from "../../../domain/services/ZoneService";

export class FindZoneByLocationUseCase {
  constructor(private readonly _zoneService: ZoneService) {}

  async execute(lat: number, lng: number): Promise<ServiceabilityResult> {
    return await this._zoneService.checkServiceability(lat, lng);
  }
}