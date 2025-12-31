import { Request, Response } from "express";
import { FindZoneByLocationUseCase } from "../../../application/use-cases/zones/FindZoneByLocationUseCase";

export class CustomerZoneController {
  constructor(private _findZoneByLocationUseCase: FindZoneByLocationUseCase) {}

  findByLocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);

      if (isNaN(lat) || isNaN(lng)) {
        res.status(400).json({ success: false, message: "Invalid coordinates" });
        return;
      }

      const result = await this._findZoneByLocationUseCase.execute(lat, lng);
      
      res.status(200).json({
        success: true,
        data: {
          name: result.isServiceable ? result.zoneName : "Outside Service Area",
          isServiceable: result.isServiceable,
          zoneId: result.zoneId
        }
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message || "Internal Server Error" 
      });
    }
  }
}