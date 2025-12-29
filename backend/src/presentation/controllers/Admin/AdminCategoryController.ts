import { Request, Response } from "express";
import { CreateCategoryUseCase } from "../../../application/use-cases/service-categories/CreateCategoryUseCase";
import { GetAllCategoriesUseCase } from "../../../application/use-cases/service-categories/GetAllCategoriesUseCase";
import { EditCategoryUseCase } from "../../../application/use-cases/service-categories/EditCategoryUseCase";
import { DeleteCategoryUseCase } from "../../../application/use-cases/service-categories/DeleteCategoryUseCase";

import { ToggleCategoryStatusUseCase } from "../../../application/use-cases/service-categories/ToggleCategoryStatus";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages, SuccessMessages } from "../../../../../shared/types/enums/ErrorMessages";

export class AdminCategoryController {
  constructor(
    private readonly createUseCase: CreateCategoryUseCase,
    private readonly getAllUseCase: GetAllCategoriesUseCase,
    private readonly editUseCase: EditCategoryUseCase,
    private readonly deleteUseCase: DeleteCategoryUseCase,

    private readonly toggleStatusUseCase: ToggleCategoryStatusUseCase
  ) {}

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { name, description, isActive } = req.body;
      const file = req.file;

      if (!name || !description || !file) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: ErrorMessages.MISSING_REQUIRED_FIELDS,
        });
      }

      const category = await this.createUseCase.execute({
        name,
        description,
        isActive: isActive === "true",
        imageFile: {
          buffer: file.buffer,
          originalName: file.originalname,
          mimeType: file.mimetype,
        },
      });

      return res.status(StatusCodes.CREATED).json({
        message: SuccessMessages.CATEGORY_CREATED,
        category,
      });
    } catch (err: any) {
      if (err.message === ErrorMessages.CATEGORY_ALREADY_EXISTS) {
        return res.status(StatusCodes.CONFLICT).json({ error: err.message });
      }
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: ErrorMessages.INTERNAL_ERROR });
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

      const result = await this.getAllUseCase.execute({
        page,
        limit,
        search,
        isActive,
      });
      return res.status(StatusCodes.OK).json(result);
    } catch (err) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { name, description, isActive } = req.body;
      const file = req.file;

      const category = await this.editUseCase.execute({
        id,
        name,
        description,
        isActive: isActive !== undefined ? isActive === "true" : undefined,
        imageFile: file
          ? {
              buffer: file.buffer,
              originalName: file.originalname,
              mimeType: file.mimetype,
            }
          : undefined,
      });

      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.CATEGORY_UPDATED,
        category,
      });
    } catch (err: any) {
      if (err.message === ErrorMessages.CATEGORY_NOT_FOUND)
        return res.status(StatusCodes.NOT_FOUND).json({ error: err.message });
      if (err.message.includes(ErrorMessages.CATEGORY_ALREADY_EXISTS))
        return res.status(StatusCodes.CONFLICT).json({ error: err.message });
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };

  toggleStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: ErrorMessages.INVALID_IS_ACTIVE });
      }

      await this.toggleStatusUseCase.execute(id, isActive);
      return res
        .status(StatusCodes.OK)
        .json({ message: `Category status updated to ${isActive}` });
    } catch (err: any) {
      if (err.message.includes(ErrorMessages.CATEGORY_NOT_FOUND))
        return res.status(StatusCodes.NOT_FOUND).json({ error: err.message });
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };

  delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      await this.deleteUseCase.execute(id);
      return res
        .status(StatusCodes.OK)
        .json({ message: SuccessMessages.CATEGORY_DELETED });
    } catch (err: any) {
      if (err.message === ErrorMessages.CATEGORY_NOT_FOUND)
        return res.status(StatusCodes.NOT_FOUND).json({ error: err.message });
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };
}
