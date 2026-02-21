// src/presentation/controllers/Customer/CustomerZoneController.ts

import { Request, Response } from "express";
import { BaseController } from "../BaseController";
import { IUseCase } from "../../../application/interfaces/IUseCase";
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { StatusCodes } from "../../utils/StatusCodes";
import { ErrorMessages } from "../../../application/constants/ErrorMessages";

export class CustomerZoneController extends BaseController {
  constructor(
    private readonly _findZoneByLocationUseCase: IUseCase<unknown, [number, number]>,
    _logger: ILogger // Passed to BaseController
  ) {
    super(_logger);
  }

  findByLocation = async (req: Request, res: Response): Promise<Response> => {
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
      return this.handleError(res, error, LogEvents.ZONE_FIND_FAILED);
    }
  }
}