import { NextFunction, Request, Response } from "express";
import { BaseController } from "../BaseController"; 
import { ILogger } from "../../../application/interfaces/services/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { StatusCodes } from "../../utils/StatusCodes"; 
import { IFindZoneByLocationUseCase } from "../../../application/interfaces/use-cases/zone/IZoneUseCases";

export class CustomerZoneController extends BaseController {
  constructor(
    private readonly _findZoneByLocationUseCase: IFindZoneByLocationUseCase,
    _logger: ILogger  
  ) {
    super(_logger);
  }

  findByLocation = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);

      if (isNaN(lat) || isNaN(lng)) { 
        return res.status(StatusCodes.BAD_REQUEST).json({ 
          success: false, 
          message: "Invalid coordinates" 
        });
      }

      const resultDto = await this._findZoneByLocationUseCase.execute(lat, lng);
       
      return this.ok(res, resultDto);
    } catch (error: unknown) { 
      (error as Error & { logContext?: string }).logContext = LogEvents.ZONE_FIND_FAILED;
      next(error);
    }
  }
}