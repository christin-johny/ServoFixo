import { Request, Response } from "express";
import { IUseCase } from "../../../application/interfaces/IUseCase";  
import { CreateServiceItemDto } from "../../../application/dto/serviceItem/CreateServiceItemDto";
import { UpdateServiceItemDto } from "../../../application/dto/serviceItem/UpdateServiceItemDto";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import {
  ErrorMessages,
  SuccessMessages,
} from "../../../../../shared/types/enums/ErrorMessages";
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

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

export class AdminServiceItemController {
  constructor( 
    private readonly _createUseCase: IUseCase<unknown, [CreateServiceItemDto, FileData[]]>, 
    private readonly _getAllUseCase: IUseCase<unknown, [ServiceQueryParams]>, 
    private readonly _deleteUseCase: IUseCase<void, [string]>, 
    private readonly _editUseCase: IUseCase<unknown, [UpdateServiceParams]>, 
    private readonly _toggleStatusUseCase: IUseCase<boolean, [string, boolean]>,
    private readonly _logger: ILogger
  ) {}

  public create = async (req: Request, res: Response): Promise<Response> => {
    try {
      this._logger.info(LogEvents.SERVICE_CREATE_INIT);

      const {
        categoryId,
        name,
        description,
        basePrice,
        specifications,
        isActive,
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

      const dto = new CreateServiceItemDto();
      dto.categoryId = categoryId;
      dto.name = name;
      dto.description = description;
      dto.basePrice = Number(basePrice);
      dto.specifications = parsedSpecs;
      dto.isActive = isActive === "true" || isActive === true;

      const result = await this._createUseCase.execute(
        dto,
        files
          ? files.map((f) => ({
              buffer: f.buffer,
              originalName: f.originalname,
              mimeType: f.mimetype,
            }))
          : []
      );

      return res.status(StatusCodes.CREATED).json({
        message: SuccessMessages.SERVICE_CREATED,
        data: result,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      this._logger.error(LogEvents.SERVICE_CREATE_FAILED, errorMessage);

      if (errorMessage === ErrorMessages.SERVICE_ALREADY_EXISTS) {
        return res.status(StatusCodes.CONFLICT).json({ error: errorMessage });
      }

      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };

  public getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const search = req.query.search as string | undefined;
      const categoryId = req.query.categoryId as string | undefined;
      const isActive =
        req.query.isActive === "true"
          ? true
          : req.query.isActive === "false"
          ? false
          : undefined;

      const result = await this._getAllUseCase.execute({
        page,
        limit,
        search,
        categoryId,
        isActive,
      });
      return res.status(StatusCodes.OK).json(result);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      this._logger.error(LogEvents.SERVICE_GET_ALL_ERROR, errorMessage);

      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };

  public update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      this._logger.info(`${LogEvents.SERVICE_UPDATE_INIT} - ID: ${id}`);

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

      const dto = new UpdateServiceItemDto();
      dto.categoryId = categoryId;
      dto.name = name;
      dto.description = description;
      dto.basePrice = basePrice ? Number(basePrice) : undefined;
      dto.specifications = parsedSpecs;
      dto.isActive =
        isActive !== undefined
          ? isActive === "true" || isActive === true
          : undefined;

      const result = await this._editUseCase.execute({
        id,
        dto,
        newImageFiles: files
          ? files.map((f) => ({
              buffer: f.buffer,
              originalName: f.originalname,
              mimeType: f.mimetype,
            }))
          : [],
        imagesToDelete: parsedDeleteList,
      });

      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.SERVICE_UPDATED,
        data: result,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      this._logger.error(LogEvents.SERVICE_UPDATE_FAILED, errorMessage);

      if (errorMessage === ErrorMessages.SERVICE_NOT_FOUND) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: errorMessage });
      }

      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };

  public toggleStatus = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: ErrorMessages.INVALID_IS_ACTIVE });
      }

      await this._toggleStatusUseCase.execute(id, isActive);
      return res
        .status(StatusCodes.OK)
        .json({ message: SuccessMessages.SERVICE_STATUS_UPDATED });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      this._logger.error(LogEvents.SERVICE_TOGGLE_STATUS_FAILED, errorMessage);

      if (errorMessage === ErrorMessages.SERVICE_NOT_FOUND) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: errorMessage });
      }

      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };

  public delete = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      await this._deleteUseCase.execute(id);
      return res
        .status(StatusCodes.OK)
        .json({ message: SuccessMessages.SERVICE_DELETED });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : String(err);

      this._logger.error(
        LogEvents.SERVICE_DELETE_FAILED,
        errorMessage
      );

      if (errorMessage === ErrorMessages.SERVICE_NOT_FOUND) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: errorMessage });
      }

      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };
}