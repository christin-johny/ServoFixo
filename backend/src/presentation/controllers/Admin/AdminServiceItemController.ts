import { Request, Response } from "express";
import { BaseController } from "../BaseController";
import { RequestMapper } from "../../utils/RequestMapper";
import { IUseCase } from "../../../application/interfaces/IUseCase";  
import { CreateServiceItemDto } from "../../../application/dto/serviceItem/CreateServiceItemDto";
import { UpdateServiceItemDto } from "../../../application/dto/serviceItem/UpdateServiceItemDto";
import { ServiceItemResponseDto } from "../../../application/dto/serviceItem/ServiceItemResponseDto";
import { PaginatedServiceResponse } from "../../../application/use-cases/service-items/GetAllServiceItemsUseCase";
import { StatusCodes } from "../../utils/StatusCodes";
import { ErrorMessages, SuccessMessages } from "../../../application/constants/ErrorMessages";
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";

interface FileData {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

interface ServiceQueryParams {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}

interface UpdateServiceParams {
    id: string;
    dto: UpdateServiceItemDto;
    newImageFiles: FileData[];
    imagesToDelete: string[];
}

export class AdminServiceItemController extends BaseController {
  constructor( 
    private readonly _createUseCase: IUseCase<ServiceItemResponseDto, [CreateServiceItemDto, FileData[]]>, 
    private readonly _getAllUseCase: IUseCase<PaginatedServiceResponse, [ServiceQueryParams]>, 
    private readonly _deleteUseCase: IUseCase<void, [string]>, 
    private readonly _editUseCase: IUseCase<ServiceItemResponseDto, [UpdateServiceParams]>, 
    private readonly _toggleStatusUseCase: IUseCase<void, [string, boolean]>,
    _logger: ILogger
  ) {
    super(_logger);
  }

  public create = async (req: Request, res: Response): Promise<Response> => {
    try {

      const { specifications, basePrice, isActive, ...rest } = req.body;
      const files = req.files as Express.Multer.File[];

      const dto = new CreateServiceItemDto();
      Object.assign(dto, rest);
      dto.basePrice = Number(basePrice);
      dto.isActive = RequestMapper.toBoolean(isActive) ?? true;
      
      try {
        dto.specifications = specifications ? JSON.parse(specifications) : [];
      } catch (e) {
        throw new Error(ErrorMessages.INVALID_SPECIFICATIONS);
      }

      const fileData = files ? files.map(f => ({
        buffer: f.buffer,
        originalName: f.originalname,
        mimeType: f.mimetype,
      })) : [];

      const result = await this._createUseCase.execute(dto, fileData);

      //  Match response.data.serviceItem expected by repository
      return res.status(StatusCodes.CREATED).json({
        message: SuccessMessages.SERVICE_CREATED,
        serviceItem: result,
      });
    } catch (err) {
      return this.handleError(res, err, LogEvents.SERVICE_CREATE_FAILED);
    }
  };

  public getAll = async (req: Request, res: Response): Promise<Response> => {
    try {

      const params: ServiceQueryParams = {
        ...RequestMapper.toPagination(req.query),
        categoryId: req.query.categoryId as string,
        isActive: RequestMapper.toBoolean(req.query.isActive)
      };

      const result = await this._getAllUseCase.execute(params);
      
      //  Match response.data directly for getServices
      return res.status(StatusCodes.OK).json(result);
    } catch (err) {
      return this.handleError(res, err, LogEvents.SERVICE_GET_ALL_ERROR);
    }
  };

  public update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      const { specifications, imagesToDelete, basePrice, isActive, ...rest } = req.body;
      const files = req.files as Express.Multer.File[];

      const dto = new UpdateServiceItemDto();
      Object.assign(dto, rest);
      dto.basePrice = basePrice ? Number(basePrice) : undefined;
      dto.isActive = RequestMapper.toBoolean(isActive);

      let parsedSpecs, parsedDeleteList;
      try {
        parsedSpecs = specifications ? JSON.parse(specifications) : [];
        parsedDeleteList = imagesToDelete ? JSON.parse(imagesToDelete) : [];
      } catch (e) {
        throw new Error(ErrorMessages.INVALID_SPECIFICATIONS);
      }

      const result = await this._editUseCase.execute({
        id,
        dto,
        newImageFiles: files ? files.map(f => ({
          buffer: f.buffer,
          originalName: f.originalname,
          mimeType: f.mimetype,
        })) : [],
        imagesToDelete: parsedDeleteList,
      });

      //  Match response.data.serviceItem
      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.SERVICE_UPDATED,
        serviceItem: result,
      });
    } catch (err) {
      return this.handleError(res, err, LogEvents.SERVICE_UPDATE_FAILED);
    }
  };

  public toggleStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const isActive = RequestMapper.toBoolean(req.body.isActive);

      if (typeof isActive !== "boolean") {
        throw new Error(ErrorMessages.INVALID_IS_ACTIVE);
      }

      await this._toggleStatusUseCase.execute(id, isActive);
      return this.ok(res, null, SuccessMessages.SERVICE_STATUS_UPDATED);
    } catch (err) {
      return this.handleError(res, err, LogEvents.SERVICE_TOGGLE_STATUS_FAILED);
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      await this._deleteUseCase.execute(req.params.id);
      return this.ok(res, null, SuccessMessages.SERVICE_DELETED);
    } catch (err) {
      return this.handleError(res, err, LogEvents.SERVICE_DELETE_FAILED);
    }
  };
}