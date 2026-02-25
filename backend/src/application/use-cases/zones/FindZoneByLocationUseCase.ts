import { IZoneService } from "../../interfaces/services/IZoneService";
import { ZoneServiceabilityDto } from "../../dto/zone/ZoneServiceabilityDto"; 
import { IFindZoneByLocationUseCase } from "../../interfaces/use-cases/zone/IZoneUseCases";

export class FindZoneByLocationUseCase implements IFindZoneByLocationUseCase {
  constructor(
    private readonly _zoneService: IZoneService, 
  ) {}

  async execute(lat: number, lng: number): Promise<ZoneServiceabilityDto> {

    const result = await this._zoneService.checkServiceability(lat, lng);

    const response: ZoneServiceabilityDto = {
      isServiceable: result.isServiceable,
      zoneId: result.zoneId || undefined,
      zoneName: result.zoneName || undefined,
      message: result.isServiceable
        ? "Location is serviceable"
        : "Outside service area",
    };


    return response;
  }
}
