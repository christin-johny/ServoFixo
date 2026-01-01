import { IZoneService } from "../../interfaces/IZoneService";
import { ZoneServiceabilityDto } from "../../dto/zone/ZoneServiceabilityDto";
import { ILogger } from "../../interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export class FindZoneByLocationUseCase {
  constructor(
    private readonly _zoneService: IZoneService,
    private readonly _logger: ILogger
  ) {}

  async execute(lat: number, lng: number): Promise<ZoneServiceabilityDto> {
    this._logger.info(LogEvents.ZONE_SERVICEABILITY_CHECK_INIT, { lat, lng });

    const result = await this._zoneService.checkServiceability(lat, lng);

    const response: ZoneServiceabilityDto = {
      isServiceable: result.isServiceable,
      zoneId: result.zoneId || undefined,
      zoneName: result.zoneName || undefined,
      message: result.isServiceable
        ? "Location is serviceable"
        : "Outside service area",
    };

    this._logger.info(LogEvents.ZONE_SERVICEABILITY_CHECK_SUCCESS, {
      isServiceable: response.isServiceable,
      zoneId: response.zoneId,
    });

    return response;
  }
}
