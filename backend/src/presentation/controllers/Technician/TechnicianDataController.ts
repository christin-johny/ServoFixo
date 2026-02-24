import { NextFunction, Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { RequestMapper } from '../../utils/RequestMapper';
import { IUseCase } from '../../../application/interfaces/services/IUseCase';
import { ILogger } from '../../../application/interfaces/services/ILogger';
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { ErrorMessages } from '../../../application/constants/ErrorMessages';
import { CategoryQueryParams } from '../../../domain/repositories/IServiceCategoryRepository';
import { PaginatedCategoriesResponse } from '../../../application/use-cases/service-categories/GetAllCategoriesUseCase';
import { ZoneQueryParams } from '../../../domain/repositories/IZoneRepository';
import { PaginatedZonesResponse } from '../../../application/use-cases/zones/GetAllZonesUseCase';
import { RateCardItem } from '../../../application/use-cases/technician/profile/GetTechnicianRateCardUseCase';

interface ServiceFilters {
  searchTerm: string;
  categoryId: string;
  page: number;
  limit: number;
  isActive?: boolean;
}

interface AuthenticatedRequest extends Request {
  userId?: string ;
}

export class TechnicianDataController extends BaseController {
  constructor(
    private readonly _getAllCategoriesUseCase: IUseCase<PaginatedCategoriesResponse, [CategoryQueryParams]>,
    private readonly _getServiceListingUseCase: IUseCase<unknown[], [ServiceFilters]>,
    private readonly _getAllZonesUseCase: IUseCase<PaginatedZonesResponse, [ZoneQueryParams]>,
    private readonly _getRateCardUseCase: IUseCase<RateCardItem[], [string]>,
    _logger: ILogger
  ) {
    super(_logger);
  }

  /**
   * Helper to extract technicianId safely
   */
  private getTechId(req: Request): string {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) throw new Error(ErrorMessages.UNAUTHORIZED);
    return userId;
  }

  public getCategories = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { page } = RequestMapper.toPagination(req.query);
      const params: CategoryQueryParams = { 
        isActive: undefined, 
        page, 
        limit: 100 
      };
      
      const result = await this._getAllCategoriesUseCase.execute(params);
      
      return this.ok(res, result.categories);
    } catch (error: unknown) {
      (error as Error & { logContext?: string }).logContext = LogEvents.TECH_CATEGORY_FETCH_FAILED;
      next(error);
    }
  };

  public getServices = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { categoryId } = req.query;
      const { page, search } = RequestMapper.toPagination(req.query);

      const filters: ServiceFilters = {
        searchTerm: search || "",
        categoryId: categoryId as string,
        page,
        limit: 100,
        isActive: undefined, 
      };

      const services = await this._getServiceListingUseCase.execute(filters);
      return this.ok(res, services);
    } catch (error: unknown) {
      (error as Error & { logContext?: string }).logContext = LogEvents.TECH_SERVICE_FETCH_FAILED;
      next(error);
    }
  };

  public getZones = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { page } = RequestMapper.toPagination(req.query);
      const params: ZoneQueryParams = { page, limit: 100, isActive: undefined };
      
      const result = await this._getAllZonesUseCase.execute(params);
      return this.ok(res, result.zones);
    } catch (error: unknown) {
      (error as Error & { logContext?: string }).logContext = LogEvents.TECH_ZONE_FETCH_FAILED;
      next(error);
    }
  };

  public getRateCard = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = this.getTechId(req);
      const rateCard = await this._getRateCardUseCase.execute(technicianId);

      return this.ok(res, rateCard);
    } catch (error: unknown) {
      (error as Error & { logContext?: string }).logContext = LogEvents.TECH_PROFILE_ERROR;
      next(error);
    }
  };
}