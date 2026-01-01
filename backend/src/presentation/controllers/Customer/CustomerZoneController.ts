import { Request, Response } from "express";
import { FindZoneByLocationUseCase } from "../../../application/use-cases/zones/FindZoneByLocationUseCase";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export class CustomerZoneController {
  constructor(
    private readonly _findZoneByLocationUseCase: FindZoneByLocationUseCase,
    private readonly _logger: ILogger
  ) {}

  findByLocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);

      if (isNaN(lat) || isNaN(lng)) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Invalid coordinates" });
        return;
      }

      this._logger.info(LogEvents.ZONE_FIND_BY_LOC_INIT, { lat, lng });

      const resultDto = await this._findZoneByLocationUseCase.execute(lat, lng);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: resultDto 
      });
    } catch (error: unknown) {
      this._logger.error(LogEvents.ZONE_FIND_FAILED, undefined, { error });
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: error instanceof Error ? error.message : ErrorMessages.INTERNAL_ERROR
      });
    }
  }
}