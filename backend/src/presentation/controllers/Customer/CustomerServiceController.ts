import { Request, Response } from "express";
import { IUseCase } from "../../../application/interfaces/IUseCase";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

// Define Filter Interface for type safety
interface ServiceFilters {
  searchTerm: string;
  categoryId: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price_asc" | "price_desc" | "newest" | "popular";
  page: number;
  limit: number;
  isActive: boolean;
}

export class CustomerServiceController {
  constructor(
    private readonly _getMostBookedUseCase: IUseCase<unknown[], [number]>,
    private readonly _getServiceListingUseCase: IUseCase<unknown[], [ServiceFilters]>,
    private readonly _getServiceByIdUseCase: IUseCase<unknown | null, [string]>,
    private readonly _logger: ILogger
  ) {}
  getMostBooked = async (req: Request, res: Response): Promise<Response> => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;

      this._logger.info(LogEvents.SERVICE_MOST_BOOKED_FETCH, { limit });

      const services = await this._getMostBookedUseCase.execute(limit);
      return res.status(StatusCodes.OK).json({ data: services });
    } catch (error: unknown) {
      this._logger.error(LogEvents.SERVICE_FETCH_FAILED, undefined, { error });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { search, categoryId, minPrice, maxPrice, sortBy, page, limit } = req.query;
      
      const filters = {
        searchTerm: search as string,
        categoryId: categoryId as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy: sortBy as any,
        page: Number(page),
        limit: Number(limit),
        isActive: true,
      };

      this._logger.info(LogEvents.SERVICE_LISTING_FETCH, { filters });

      const services = await this._getServiceListingUseCase.execute(filters);

      return res.status(StatusCodes.OK).json({
        success: true,
        count: services.length,
        data: services,
      });
    } catch (error: unknown) {
      this._logger.error(LogEvents.SERVICE_FETCH_FAILED, undefined, { error });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      this._logger.info(LogEvents.SERVICE_BY_ID_FETCH, { serviceId: id });

      const service = await this._getServiceByIdUseCase.execute(id);

      if (!service) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ success: false, message: ErrorMessages.SERVICE_NOT_FOUND });
      }

      return res.status(StatusCodes.OK).json({ success: true, data: service });
    } catch (error: unknown) {
      this._logger.error(LogEvents.SERVICE_FETCH_FAILED, undefined, { error, serviceId: req.params.id });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        error: ErrorMessages.INTERNAL_ERROR,
      });
    }
  };
}