import { Request, Response } from "express";
import { CreateZoneUseCase } from "../../../application/use-cases/zones/CreateZoneUseCase";
import { GetAllZonesUseCase } from "../../../application/use-cases/zones/GetAllZonesUseCase";
import { DeleteZoneUseCase } from "../../../application/use-cases/zones/DeleteZoneUseCase";
import { EditZoneUseCase } from "../../../application/use-cases/zones/EditZoneUseCase";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages,SuccessMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class AdminZoneController {
  constructor(
    private readonly createZoneUseCase: CreateZoneUseCase,
    private readonly getAllZonesUseCase: GetAllZonesUseCase,
    private readonly deleteZoneUseCase: DeleteZoneUseCase,
    private readonly editZoneUseCase: EditZoneUseCase
  ) {}

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name, description, boundaries, isActive } = req.body;

      if (
        !name ||
        !boundaries ||
        !Array.isArray(boundaries) ||
        boundaries.length < 3
      ) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error:
            ErrorMessages.MISSING_REQUIRED_FIELDS +
            " (Valid boundaries required)",
        });
      }

      const zone = await this.createZoneUseCase.execute({
        name,
        description,
        boundaries,
        isActive,
      });

      return res.status(StatusCodes.CREATED).json({
        message: SuccessMessages.ZONE_CREATED,
        zone,
      });
    } catch (err: any) {
      if (err.message === ErrorMessages.ZONE_ALREADY_EXISTS) {
        return res.status(StatusCodes.CONFLICT).json({ error: err.message });
      }

      if (err.message && err.message.includes(ErrorMessages.INVALID_ZONE)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: err.message });
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;

      let isActive: boolean | undefined;
      if (req.query.isActive === "true") isActive = true;
      if (req.query.isActive === "false") isActive = false;

      const result = await this.getAllZonesUseCase.execute({
        page,
        limit,
        search,
        isActive,
      });

      return res.status(StatusCodes.OK).json(result);
    } catch (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      await this.deleteZoneUseCase.execute(id);
      return res
        .status(StatusCodes.OK)
        .json({ message: SuccessMessages.ZONE_DELETED });
    } catch (err: any) {
      if (err.message === ErrorMessages.ZONE_DELETE_FAILED) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: ErrorMessages.ZONE_NOT_FOUND });
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { name, description, boundaries, isActive } = req.body;

      if (boundaries && (!Array.isArray(boundaries) || boundaries.length < 3)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error:ErrorMessages.INVALID_BOUNDARIES
        });
      }

      const updatedZone = await this.editZoneUseCase.execute({
        id,
        name,
        description,
        boundaries,
        isActive,
      });

      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.ZONE_UPDATED,
        zone: updatedZone,
      });
    } catch (err: any) {
      if (err.message === ErrorMessages.ZONE_NOT_FOUND) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: err.message });
      }

      if (err.message === ErrorMessages.ZONE_ALREADY_EXISTS) {
        return res.status(StatusCodes.CONFLICT).json({ error: err.message });
      }

      if (err.message && err.message.includes(ErrorMessages.INVALID_ZONE)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: err.message });
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };
}
