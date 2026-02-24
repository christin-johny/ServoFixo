import { NextFunction, Request, Response } from "express";
import { BaseController } from "../BaseController";
import { RequestMapper } from "../../utils/RequestMapper";
import { IUseCase } from "../../../application/interfaces/services/IUseCase";  
import { CreateCategoryDto } from "../../../application/dto/category/CreateCategoryDto";
import { UpdateCategoryDto } from "../../../application/dto/category/UpdateCategoryDto";
import { CategoryResponseDto, PaginatedCategoriesResponse } from "../../../application/dto/category/CategoryResponseDto";
import { CategoryQueryParams } from "../../../domain/repositories/IServiceCategoryRepository";
import { SuccessMessages, ErrorMessages } from "../../../application/constants/ErrorMessages";
import { ILogger } from "../../../application/interfaces/services/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { StatusCodes } from "../../utils/StatusCodes";

interface FileData {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export class AdminCategoryController extends BaseController {
  constructor(
    private readonly _createUseCase: IUseCase<CategoryResponseDto, [CreateCategoryDto, FileData | undefined]>,
    private readonly _getAllUseCase: IUseCase<PaginatedCategoriesResponse, [CategoryQueryParams]>,
    private readonly _editUseCase: IUseCase<CategoryResponseDto, [string, UpdateCategoryDto, FileData | undefined]>,
    private readonly _deleteUseCase: IUseCase<void, [string]>,
    private readonly _toggleStatusUseCase: IUseCase<void, [string, boolean]>,
    _logger: ILogger
  ) {
    super(_logger);
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const dto: CreateCategoryDto = {
        name: req.body.name,
        description: req.body.description,
        isActive: RequestMapper.toBoolean(req.body.isActive) ?? true,
      };

      const file = req.file;
      const fileData = file ? {
        buffer: file.buffer, 
        originalName: file.originalname, 
        mimeType: file.mimetype,
      } : undefined;

      const result = await this._createUseCase.execute(dto, fileData);

      return res.status(StatusCodes.CREATED).json({
        success: true,
        message: SuccessMessages.CATEGORY_CREATED,
        data: result, 
      });
    } catch (err) { 
      (err as Error & { logContext?: string }).logContext = LogEvents.CATEGORY_CREATE_FAILED;
      next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const params: CategoryQueryParams = {
        ...RequestMapper.toPagination(req.query),
        isActive: RequestMapper.toBoolean(req.query.isActive),
      };

      const result = await this._getAllUseCase.execute(params);
      return res.status(StatusCodes.OK).json(result);
    } catch (err) { 
      (err as Error & { logContext?: string }).logContext = LogEvents.CATEGORY_GET_ALL_ERROR;
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { id } = req.params;

      const dto: UpdateCategoryDto = {
        name: req.body.name,
        description: req.body.description,
        isActive: RequestMapper.toBoolean(req.body.isActive),
      };

      const file = req.file;
      const fileData = file ? {
        buffer: file.buffer, 
        originalName: file.originalname, 
        mimeType: file.mimetype,
      } : undefined;

      const result = await this._editUseCase.execute(id, dto, fileData);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: SuccessMessages.CATEGORY_UPDATED,
        data: result,
      });
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.CATEGORY_UPDATE_FAILED;
      next(err);
    }
  };

  toggleStatus = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const isActive = RequestMapper.toBoolean(req.body.isActive);

      if (isActive === undefined) {
        throw new Error(ErrorMessages.INVALID_IS_ACTIVE);
      }

      await this._toggleStatusUseCase.execute(id, isActive);
      return this.ok(res, null, `Category status updated to ${isActive}`);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.CATEGORY_TOGGLE_STATUS_FAILED;
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { id } = req.params;
      await this._deleteUseCase.execute(id);
      return this.ok(res, null, SuccessMessages.CATEGORY_DELETED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.CATEGORY_DELETE_FAILED;
      next(err);
    }
  };
}