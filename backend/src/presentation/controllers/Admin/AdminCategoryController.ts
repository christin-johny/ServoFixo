import { Request, Response } from "express";
import { CreateCategoryUseCase } from "../../../application/use-cases/service-categories/CreateCategoryUseCase";
import { GetAllCategoriesUseCase } from "../../../application/use-cases/service-categories/GetAllCategoriesUseCase";
import { EditCategoryUseCase } from "../../../application/use-cases/service-categories/EditCategoryUseCase";
import { DeleteCategoryUseCase } from "../../../application/use-cases/service-categories/DeleteCategoryUseCase";
import { ToggleCategoryStatusUseCase } from "../../../application/use-cases/service-categories/ToggleCategoryStatus";
import { CreateCategoryDto } from "../../../application/dto/category/CreateCategoryDto";
import { UpdateCategoryDto } from "../../../application/dto/category/UpdateCategoryDto";
import { CategoryQueryParams } from "../../../domain/repositories/IServiceCategoryRepository";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages, SuccessMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class AdminCategoryController {
  constructor(
    private readonly _createUseCase: CreateCategoryUseCase,
    private readonly _getAllUseCase: GetAllCategoriesUseCase,
    private readonly _editUseCase: EditCategoryUseCase,
    private readonly _deleteUseCase: DeleteCategoryUseCase,
    private readonly _toggleStatusUseCase: ToggleCategoryStatusUseCase
  ) {}

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const dto: CreateCategoryDto = {
        name: req.body.name,
        description: req.body.description,
        isActive: req.body.isActive === "true" || req.body.isActive === true,
      };

      const file = req.file;

      const resultDto = await this._createUseCase.execute(dto, file ? {
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
      } : undefined);

      return res.status(StatusCodes.CREATED).json({
        message: SuccessMessages.CATEGORY_CREATED,
        data: resultDto,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === ErrorMessages.CATEGORY_ALREADY_EXISTS) {
          return res.status(StatusCodes.CONFLICT).json({ error: error.message });
        }
        if (error.message.includes("required")) {
           return res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const params: CategoryQueryParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string | undefined,
        isActive: req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined
      };

      const result = await this._getAllUseCase.execute(params);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: unknown) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      
      const dto: UpdateCategoryDto = {
        name: req.body.name,
        description: req.body.description,
        isActive: req.body.isActive !== undefined ? (req.body.isActive === "true" || req.body.isActive === true) : undefined
      };
      
      const file = req.file;

      const resultDto = await this._editUseCase.execute(id, dto, file ? {
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
      } : undefined);

      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.CATEGORY_UPDATED,
        data: resultDto,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === ErrorMessages.CATEGORY_NOT_FOUND)
          return res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
        if (error.message.includes(ErrorMessages.CATEGORY_ALREADY_EXISTS))
          return res.status(StatusCodes.CONFLICT).json({ error: error.message });
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };

  toggleStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: ErrorMessages.INVALID_IS_ACTIVE });
      }

      await this._toggleStatusUseCase.execute(id, isActive);
      return res.status(StatusCodes.OK).json({ message: `Category status updated to ${isActive}` });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes(ErrorMessages.CATEGORY_NOT_FOUND))
        return res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      await this._deleteUseCase.execute(id);
      return res.status(StatusCodes.OK).json({ message: SuccessMessages.CATEGORY_DELETED });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === ErrorMessages.CATEGORY_NOT_FOUND)
        return res.status(StatusCodes.NOT_FOUND).json({ error: error.message });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };
}