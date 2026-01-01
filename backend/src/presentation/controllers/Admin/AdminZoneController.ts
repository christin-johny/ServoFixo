import { Request, Response } from "express";
import { IUseCase } from "../../../application/interfaces/IUseCase"; 
import { CreateZoneDto } from "../../../application/dto/zone/CreateZoneDto";
import { UpdateZoneDto } from "../../../application/dto/zone/UpdateZoneDto";
import { ILogger } from '../../../application/interfaces/ILogger';
import { ZoneQueryParams } from "../../../domain/repositories/IZoneRepository";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages, SuccessMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export class AdminZoneController {
  constructor(
    private readonly _createZoneUseCase: IUseCase<unknown, [CreateZoneDto]>,
    private readonly _getAllZonesUseCase: IUseCase<unknown, [ZoneQueryParams]>,
    private readonly _deleteZoneUseCase: IUseCase<void, [string]>,
    private readonly _editZoneUseCase: IUseCase<unknown, [string, UpdateZoneDto]>,
    private readonly _logger: ILogger
  ) {}

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const dto = req.body as CreateZoneDto;
      this._logger.info(LogEvents.ZONE_CREATE_INIT, { body: req.body });

      if (!dto.name || !dto.boundaries || !Array.isArray(dto.boundaries) || dto.boundaries.length < 3) {
        this._logger.warn(LogEvents.ZONE_CREATE_FAILED, { reason: "Invalid boundaries or missing fields", dto });
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS + " (Valid boundaries required)",
        });
      }

      const resultDto = await this._createZoneUseCase.execute(dto);

      return res.status(StatusCodes.CREATED).json({
        message: SuccessMessages.ZONE_CREATED,
        data: resultDto, 
      });
    } catch (err: unknown) {
      this._logger.error(LogEvents.ZONE_CREATE_FAILED, err instanceof Error ? err.stack : undefined, { error: err });
      
      if (err instanceof Error) {
        if (err.message === ErrorMessages.ZONE_ALREADY_EXISTS) {
          return res.status(StatusCodes.CONFLICT).json({ error: err.message });
        }
        if (err.message.includes(ErrorMessages.INVALID_ZONE)) {
          return res.status(StatusCodes.BAD_REQUEST).json({ error: err.message });
        }
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      this._logger.info(LogEvents.ZONE_GET_ALL_INIT, { query: req.query });

      const params: ZoneQueryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string | undefined,
        isActive: req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined
      };

      const result = await this._getAllZonesUseCase.execute(params);

      return res.status(StatusCodes.OK).json(result);
    } catch (err: unknown) {
      this._logger.error(LogEvents.ZONE_GET_ALL_ERROR, undefined, { error: err });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      this._logger.info(LogEvents.ZONE_DELETE_INIT, { id });

      await this._deleteZoneUseCase.execute(id);
      
      return res.status(StatusCodes.OK).json({ message: SuccessMessages.ZONE_DELETED });
    } catch (err: unknown) {
      this._logger.error(LogEvents.ZONE_DELETE_FAILED, undefined, { id: req.params.id, error: err });

      if (err instanceof Error) {
        if (err.message === ErrorMessages.ZONE_DELETE_FAILED || err.message === 'Zone not found or could not be deleted') {
          return res.status(StatusCodes.NOT_FOUND).json({ error: ErrorMessages.ZONE_NOT_FOUND });
        }
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
      
      this._logger.info(LogEvents.ZONE_UPDATE_INIT, { id, dto });

      if (dto.boundaries && (!Array.isArray(dto.boundaries) || dto.boundaries.length < 3)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.INVALID_BOUNDARIES
        });
      }

      const resultDto = await this._editZoneUseCase.execute(id, dto);

      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.ZONE_UPDATED,
        data: resultDto,
      });
    } catch (err: unknown) {
      this._logger.error(LogEvents.ZONE_UPDATE_FAILED, undefined, { id: req.params.id, error: err });

      if (err instanceof Error) {
        if (err.message === ErrorMessages.ZONE_NOT_FOUND) {
          return res.status(StatusCodes.NOT_FOUND).json({ error: err.message });
        }
        if (err.message === ErrorMessages.ZONE_ALREADY_EXISTS) {
          return res.status(StatusCodes.CONFLICT).json({ error: err.message });
        }
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };
}