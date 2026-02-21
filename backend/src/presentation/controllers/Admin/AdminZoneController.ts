import { Request, Response } from "express";
import { BaseController } from "../BaseController";
import { RequestMapper } from "../../utils/RequestMapper";
import { IUseCase } from "../../../application/interfaces/IUseCase"; 
import { CreateZoneDto } from "../../../application/dto/zone/CreateZoneDto";
import { UpdateZoneDto } from "../../../application/dto/zone/UpdateZoneDto";
import { ZoneResponseDto } from "../../../application/dto/zone/ZoneResponseDto";
import { PaginatedZonesResponse } from "../../../application/use-cases/zones/GetAllZonesUseCase";
import { ILogger } from '../../../application/interfaces/ILogger';
import { ZoneQueryParams } from "../../../domain/repositories/IZoneRepository";
import { StatusCodes } from "../../utils/StatusCodes";
import { ErrorMessages, SuccessMessages } from "../../../application/constants/ErrorMessages";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";

export class AdminZoneController extends BaseController {
  constructor(
    private readonly _createZoneUseCase: IUseCase<ZoneResponseDto, [CreateZoneDto]>,
    private readonly _getAllZonesUseCase: IUseCase<PaginatedZonesResponse, [ZoneQueryParams]>,
    private readonly _deleteZoneUseCase: IUseCase<boolean, [string]>, 
    private readonly _editZoneUseCase: IUseCase<ZoneResponseDto, [string, UpdateZoneDto]>,
    _logger: ILogger
  ) {
    super(_logger);
  }

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const dto = req.body as CreateZoneDto;

      if (!dto.name || !dto.boundaries || !Array.isArray(dto.boundaries) || dto.boundaries.length < 3) {
        throw new Error(ErrorMessages.MISSING_REQUIRED_FIELDS + " (Valid boundaries required)");
      }

      const result = await this._createZoneUseCase.execute(dto);

      //  Aligned with createZone: response.data.zone
      return res.status(StatusCodes.CREATED).json({
        message: SuccessMessages.ZONE_CREATED,
        zone: result, 
      });
    } catch (err: unknown) {
      return this.handleError(res, err, LogEvents.ZONE_CREATE_FAILED);
    }
  };

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {

      const params: ZoneQueryParams = {
        ...RequestMapper.toPagination(req.query),
        isActive: RequestMapper.toBoolean(req.query.isActive)
      };

      const result = await this._getAllZonesUseCase.execute(params);

      //  Aligned with getZones: response.data directly
      return res.status(StatusCodes.OK).json(result);
    } catch (err: unknown) {
      return this.handleError(res, err, LogEvents.ZONE_GET_ALL_ERROR);
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const dto = req.body as UpdateZoneDto;

      if (dto.boundaries && (!Array.isArray(dto.boundaries) || dto.boundaries.length < 3)) {
        throw new Error(ErrorMessages.INVALID_BOUNDARIES);
      }

      const result = await this._editZoneUseCase.execute(id, dto);

      //  Aligned with updateZone: response.data.zone
      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.ZONE_UPDATED,
        zone: result,
      });
    } catch (err: unknown) {
      return this.handleError(res, err, LogEvents.ZONE_UPDATE_FAILED);
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      await this._deleteZoneUseCase.execute(id);
      
      return this.ok(res, null, SuccessMessages.ZONE_DELETED);
    } catch (err: unknown) {
      return this.handleError(res, err, LogEvents.ZONE_DELETE_FAILED);
    }
  };
}