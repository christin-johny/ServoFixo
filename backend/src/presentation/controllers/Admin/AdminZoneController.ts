import { Request, Response } from "express";
import { CreateZoneUseCase } from "../../../application/use-cases/zones/CreateZoneUseCase";
import { GetAllZonesUseCase } from "../../../application/use-cases/zones/GetAllZonesUseCase";
import { DeleteZoneUseCase } from "../../../application/use-cases/zones/DeleteZoneUseCase";
import { EditZoneUseCase } from "../../../application/use-cases/zones/EditZoneUseCase";
import { CreateZoneDto } from "../../../application/dto/zone/CreateZoneDto";
import { UpdateZoneDto } from "../../../application/dto/zone/UpdateZoneDto";
import { ZoneQueryParams } from "../../../domain/repositories/IZoneRepository";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages, SuccessMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class AdminZoneController {
  constructor(
    private readonly _createZoneUseCase: CreateZoneUseCase,
    private readonly _getAllZonesUseCase: GetAllZonesUseCase,
    private readonly _deleteZoneUseCase: DeleteZoneUseCase,
    private readonly _editZoneUseCase: EditZoneUseCase
  ) {}

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      // 1. Strict Typing using DTO
      const dto = req.body as CreateZoneDto;

      // 2. Controller Validation (Or use Middleware like class-validator)
      if (
        !dto.name ||
        !dto.boundaries ||
        !Array.isArray(dto.boundaries) ||
        dto.boundaries.length < 3
      ) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS + " (Valid boundaries required)",
        });
      }

      // 3. Execute returns ZoneResponseDto
      const resultDto = await this._createZoneUseCase.execute(dto);

      return res.status(StatusCodes.CREATED).json({
        message: SuccessMessages.ZONE_CREATED,
        data: resultDto, // Consistency: always use 'data'
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
      // Strict Query Param extraction
      const params: ZoneQueryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string | undefined,
        isActive: req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined
      };

      const result = await this._getAllZonesUseCase.execute(params);

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
      await this._deleteZoneUseCase.execute(id);
      return res
        .status(StatusCodes.OK)
        .json({ message: SuccessMessages.ZONE_DELETED });
    } catch (err: any) {
      if (err.message === ErrorMessages.ZONE_DELETE_FAILED || err.message === 'Zone not found or could not be deleted') {
        return res.status(StatusCodes.NOT_FOUND).json({ error: ErrorMessages.ZONE_NOT_FOUND });
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const dto = req.body as UpdateZoneDto;

      // Controller Validation for Update
      if (dto.boundaries && (!Array.isArray(dto.boundaries) || dto.boundaries.length < 3)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.INVALID_BOUNDARIES
        });
      }

      const resultDto = await this._editZoneUseCase.execute(id, dto);

      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.ZONE_UPDATED,
        data: resultDto, // Consistency: always use 'data'
      });
    } catch (err: any) {
      if (err.message === ErrorMessages.ZONE_NOT_FOUND) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: err.message });
      }
      if (err.message === ErrorMessages.ZONE_ALREADY_EXISTS) {
        return res.status(StatusCodes.CONFLICT).json({ error: err.message });
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };
}