import { Request, Response } from "express";
import { FindZoneByLocationUseCase } from "../../../application/use-cases/zones/FindZoneByLocationUseCase";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class CustomerZoneController {
  constructor(private _findZoneByLocationUseCase: FindZoneByLocationUseCase) {}

  findByLocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);

      if (isNaN(lat) || isNaN(lng)) {
        res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Invalid coordinates" });
        return;
      }

      const resultDto = await this._findZoneByLocationUseCase.execute(lat, lng);
      
      res.status(StatusCodes.OK).json({
        success: true,
        data: resultDto 
      });
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        message: error.message || ErrorMessages.INTERNAL_ERROR
      });
    }
  }
}