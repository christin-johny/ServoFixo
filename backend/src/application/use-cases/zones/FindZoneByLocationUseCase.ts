import { IZoneService } from "../../interfaces/IZoneService";
import { ZoneServiceabilityDto } from "../../dto/zone/ZoneServiceabilityDto";
import { ILogger } from "../../interfaces/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";

export class FindZoneByLocationUseCase {
  constructor(
    private readonly _zoneService: IZoneService,
    private readonly _logger: ILogger
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
