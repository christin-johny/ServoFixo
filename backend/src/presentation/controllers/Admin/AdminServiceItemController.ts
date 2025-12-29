import { Request, Response } from "express";
import { CreateServiceItemUseCase } from "../../../application/use-cases/service-items/CreateServiceItemUseCase";
import { GetAllServiceItemsUseCase } from "../../../application/use-cases/service-items/GetAllServiceItemsUseCase";
import { DeleteServiceItemUseCase } from "../../../application/use-cases/service-items/DeleteServiceItemUseCase";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import {ErrorMessages,SuccessMessages,} from "../../../../../shared/types/enums/ErrorMessages";
import { EditServiceItemUseCase } from "../../../application/use-cases/service-items/EditServiceItemUseCase";
import { ToggleServiceItemStatusUseCase } from "../../../application/use-cases/service-items/ToggleServiceItemStatus";

export class AdminServiceItemController {
  constructor(
    private readonly createUseCase: CreateServiceItemUseCase,
    private readonly getAllUseCase: GetAllServiceItemsUseCase,
    private readonly deleteUseCase: DeleteServiceItemUseCase,
    private readonly editUseCase: EditServiceItemUseCase,
    private readonly toggleStatusUseCase: ToggleServiceItemStatusUseCase
  ) {}

  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const {
        categoryId,
        name,
        description,
        basePrice,
        specifications,
        isActive,
      } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: ErrorMessages.INVALID_IMAGES });
      }

      let parsedSpecs = [];
      try {
        parsedSpecs = specifications ? JSON.parse(specifications) : [];
      } catch (e) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: ErrorMessages.INVALID_SPECIFICATIONS });
      }

      const serviceItem = await this.createUseCase.execute({
        categoryId,
        name,
        description,
        basePrice: Number(basePrice),
        specifications: parsedSpecs,
        isActive: isActive === "true",
        imageFiles: files.map((f) => ({
          buffer: f.buffer,
          originalName: f.originalname,
          mimeType: f.mimetype,
        })),
      });

      return res.status(StatusCodes.CREATED).json({
        message: SuccessMessages.SERVICE_CREATED,
        serviceItem,
      });
    } catch (err: any) {
      if (err.code === 11000) {
        return res
          .status(StatusCodes.CONFLICT)
          .json({ error: ErrorMessages.SERVICE_ALREADY_EXISTS });
      }
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: err.message || ErrorMessages.INTERNAL_ERROR });
    }
  };

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;
      const categoryId = req.query.categoryId as string | undefined;

      let isActive: boolean | undefined;
      if (req.query.isActive === "true") isActive = true;
      if (req.query.isActive === "false") isActive = false;

      const result = await this.getAllUseCase.execute({
        page,
        limit,
        search,
        categoryId,
        isActive,
      });

      return res.status(StatusCodes.OK).json(result);
    } catch (err) {
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
        .json({ message: SuccessMessages.SERVICE_DELETED });
    } catch (err: any) {
      if (err.message === ErrorMessages.SERVICE_NOT_FOUND) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: err.message });
      }
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const {
        categoryId,
        name,
        description,
        basePrice,
        specifications,
        isActive,
        imagesToDelete,
      } = req.body;
      const files = req.files as Express.Multer.File[];

      let parsedSpecs = [];
      try {
        parsedSpecs = specifications ? JSON.parse(specifications) : [];
      } catch (e) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: ErrorMessages.INVALID_SPECIFICATIONS });
      }

      let parsedDeleteList: string[] = [];
      try {
        parsedDeleteList = imagesToDelete ? JSON.parse(imagesToDelete) : [];
      } catch (e) {
        parsedDeleteList = [];
      }

      const updatedService = await this.editUseCase.execute({
        id,
        categoryId,
        name,
        description,
        basePrice: Number(basePrice),
        specifications: parsedSpecs,
        isActive: isActive === "true",
        newImageFiles: files
          ? files.map((f) => ({
              buffer: f.buffer,
              originalName: f.originalname,
              mimeType: f.mimetype,
            }))
          : [],
        imagesToDelete: parsedDeleteList,
      });

      return res
        .status(StatusCodes.OK)
        .json({
          message: SuccessMessages.SERVICE_UPDATED,
          serviceItem: updatedService,
        });
    } catch (err: any) {
      if (err.message === ErrorMessages.SERVICE_ALREADY_EXISTS) {
        return res.status(StatusCodes.CONFLICT).json({ error: err.message });
      }
      if (err.code === 11000) {
        return res
          .status(StatusCodes.CONFLICT)
          .json({ error: ErrorMessages.SERVICE_ALREADY_EXISTS });
      }
      if (err.message === ErrorMessages.SERVICE_NOT_FOUND) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: err.message });
      }
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: err.message });
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
        .json({ message: SuccessMessages.SERVICE_STATUS_UPDATED, isActive });
    } catch (err: any) {
      if (err.message.includes("not found"))
        return res.status(StatusCodes.NOT_FOUND).json({ error: err.message });
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };
}
