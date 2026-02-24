import { NextFunction, Request, Response } from "express";
import { BaseController } from "../BaseController";
import { RequestMapper } from "../../utils/RequestMapper";
import { IUseCase } from "../../../application/interfaces/services/IUseCase";
import { ILogger } from "../../../application/interfaces/services/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { Review } from "../../../domain/entities/Review";  
 
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
    private readonly _getServiceReviewsUseCase: IUseCase<Review[], [string, number]>, 
    _logger: ILogger
  ) {
    super(_logger);
  }

  getMostBooked = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { limit } = RequestMapper.toPagination(req.query);
      
      const services = await this._getMostBookedUseCase.execute(limit);
      return this.ok(res, services);
    } catch (error: unknown) {
      (error as Error & { logContext?: string }).logContext = LogEvents.SERVICE_FETCH_FAILED;
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { search, categoryId, minPrice, maxPrice, sortBy } = req.query;
      const { page, limit } = RequestMapper.toPagination(req.query);
      
      const filters: ServiceFilters = {
        searchTerm: search as string,
        categoryId: categoryId as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy: sortBy as "price_asc" | "price_desc" | "newest" | "popular" | undefined,
        page,
        limit,
        isActive: true,
      };

      const services = await this._getServiceListingUseCase.execute(filters);
      return this.ok(res, services);
    } catch (error: unknown) {
      (error as Error & { logContext?: string }).logContext = LogEvents.SERVICE_FETCH_FAILED;
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { id } = req.params;
      
      const service = await this._getServiceByIdUseCase.execute(id);
      return this.ok(res, service);
    } catch (error: unknown) {
      (error as Error & { logContext?: string }).logContext = LogEvents.SERVICE_FETCH_FAILED;
      next(error);
    }
  };

  getReviews = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const limit = Number(req.query.limit) || 5;

      const reviews = await this._getServiceReviewsUseCase.execute(id, limit);
      
      const response = reviews.map(r => {
          const snapshot = r.getCustomerSnapshot(); 
          return {
            id: r.getId(),
            rating: r.getRating(),
            comment: r.getComment(),
            date: r.getCreatedAt(),
            customerName: snapshot?.name || "Anonymous User",
            customerAvatar: snapshot?.avatarUrl
          };
      });

      return this.ok(res, response);
    } catch (error: unknown) {
      (error as Error & { logContext?: string }).logContext = "FETCH_REVIEWS_FAILED";
      next(error);
    }
  };
}