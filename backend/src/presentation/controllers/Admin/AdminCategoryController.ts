// src/presentation/controllers/admin/AdminCategoryController.ts

import { Request, Response } from "express";
import { BaseController } from "../BaseController";
import { RequestMapper } from "../../utils/RequestMapper";
import { IUseCase } from "../../../application/interfaces/IUseCase";  
import { CreateCategoryDto } from "../../../application/dto/category/CreateCategoryDto";
import { UpdateCategoryDto } from "../../../application/dto/category/UpdateCategoryDto";
import { CategoryResponseDto } from "../../../application/dto/category/CategoryResponseDto";
import { PaginatedCategoriesResponse } from "../../../application/use-cases/service-categories/GetAllCategoriesUseCase";
import { CategoryQueryParams } from "../../../domain/repositories/IServiceCategoryRepository";
import { SuccessMessages, ErrorMessages } from "../../../application/constants/ErrorMessages";
import { ILogger } from "../../../application/interfaces/ILogger";
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

create = async (req: Request, res: Response): Promise<Response> => {
    try {

      const dto: CreateCategoryDto = {
        name: req.body.name,
        description: req.body.description,
        isActive: RequestMapper.toBoolean(req.body.isActive) ?? true,
      };

      const file = req.file;
      const fileData = file ? {
        buffer: file.buffer, originalName: file.originalname, mimeType: file.mimetype,
      } : undefined;

      const result = await this._createUseCase.execute(dto, fileData);

      //  FIX: Match response.data.data for createCategory
      return res.status(StatusCodes.CREATED).json({
        success: true,
        message: SuccessMessages.CATEGORY_CREATED,
        data: result, 
      });
    } catch (error) {
      return this.handleError(res, error, LogEvents.CATEGORY_CREATE_FAILED);
    }
  };

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {

      const params: CategoryQueryParams = {
        ...RequestMapper.toPagination(req.query),
        isActive: RequestMapper.toBoolean(req.query.isActive),
      };

      const result = await this._getAllUseCase.execute(params);

      //  FIX: Match response.data for getCategories
      // We return the paginated object directly
      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      return this.handleError(res, error, LogEvents.CATEGORY_GET_ALL_ERROR);
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      const dto: UpdateCategoryDto = {
        name: req.body.name,
        description: req.body.description,
        isActive: RequestMapper.toBoolean(req.body.isActive),
      };

      const file = req.file;
      const fileData = file ? {
        buffer: file.buffer, originalName: file.originalname, mimeType: file.mimetype,
      } : undefined;

      const result = await this._editUseCase.execute(id, dto, fileData);

      //  FIX: Match response.data.data for updateCategory
      return res.status(StatusCodes.OK).json({
        success: true,
        message: SuccessMessages.CATEGORY_UPDATED,
        data: result,
      });
    } catch (error) {
      return this.handleError(res, error, LogEvents.CATEGORY_UPDATE_FAILED);
    }
  };




  toggleStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const isActive = RequestMapper.toBoolean(req.body.isActive);

      if (isActive === undefined) {
        throw new Error(ErrorMessages.INVALID_IS_ACTIVE);
      }

      await this._toggleStatusUseCase.execute(id, isActive);
      return this.ok(res, null, `Category status updated to ${isActive}`);
    } catch (error) {
      return this.handleError(res, error, LogEvents.CATEGORY_TOGGLE_STATUS_FAILED);
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      await this._deleteUseCase.execute(id);
      return this.ok(res, null, SuccessMessages.CATEGORY_DELETED);
    } catch (error) {
      return this.handleError(res, error, LogEvents.CATEGORY_DELETE_FAILED);
    }
  };
}