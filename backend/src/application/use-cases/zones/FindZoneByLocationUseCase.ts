import { ZoneService, ServiceabilityResult } from "../../../domain/services/ZoneService";

export class FindZoneByLocationUseCase {
  constructor(private readonly zoneService: ZoneService) {}

  async execute(lat: number, lng: number): Promise<ServiceabilityResult> {
    return await this.zoneService.checkServiceability(lat, lng);
  }
}