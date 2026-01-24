import { Request, Response } from "express";
import { BaseController } from "../BaseController";
import { RequestMapper } from "../../utils/RequestMapper";
import { IUseCase } from "../../../application/interfaces/IUseCase";
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";
 
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

export class CustomerServiceController extends BaseController {
  constructor(
    private readonly _getMostBookedUseCase: IUseCase<unknown[], [number]>,
    private readonly _getServiceListingUseCase: IUseCase<unknown[], [ServiceFilters]>,
    private readonly _getServiceByIdUseCase: IUseCase<unknown | null, [string]>,
    _logger: ILogger
  ) {
    super(_logger);
  }

  getMostBooked = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { limit } = RequestMapper.toPagination(req.query);
      
      this._logger.info(LogEvents.SERVICE_MOST_BOOKED_FETCH, { limit });

      const services = await this._getMostBookedUseCase.execute(limit);
 
      return this.ok(res, services);
    } catch (error: unknown) {
      return this.handleError(res, error, LogEvents.SERVICE_FETCH_FAILED);
    }
  };

  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { search, categoryId, minPrice, maxPrice, sortBy } = req.query;
      const { page, limit } = RequestMapper.toPagination(req.query);
      
      const filters: ServiceFilters = {
        searchTerm: search as string,
        categoryId: categoryId as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy: sortBy as any,
        page,
        limit,
        isActive: true,
      };

      this._logger.info(LogEvents.SERVICE_LISTING_FETCH, { filters });

      const services = await this._getServiceListingUseCase.execute(filters);
 
      return this.ok(res, services);
    } catch (error: unknown) {
      return this.handleError(res, error, LogEvents.SERVICE_FETCH_FAILED);
    }
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      this._logger.info(LogEvents.SERVICE_BY_ID_FETCH, { serviceId: id });

      const service = await this._getServiceByIdUseCase.execute(id);
 
      return this.ok(res, service);
    } catch (error: unknown) {
      return this.handleError(res, error, LogEvents.SERVICE_FETCH_FAILED);
    }
  };
}