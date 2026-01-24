import { Request, Response } from 'express';
import { BaseController } from '../BaseController';
import { RequestMapper } from '../../utils/RequestMapper';
import { IUseCase } from '../../../application/interfaces/IUseCase';
import { ILogger } from '../../../application/interfaces/ILogger';
import { StatusCodes } from '../../../../../shared/types/enums/StatusCodes';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';
import { LogEvents } from "../../../../../shared/constants/LogEvents";
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

  public getCategories = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Using standard RequestMapper for pagination logic
      const { page, limit } = RequestMapper.toPagination(req.query);
      const params: CategoryQueryParams = { 
        isActive: undefined, 
        page, 
        limit: 100 // Keep as 100 to ensure dropdowns are populated in onboarding
      };
      
      const result = await this._getAllCategoriesUseCase.execute(params);
      
      // Matches technicianOnboardingRepository.getCategories which expects res.data.data
      return this.ok(res, result.categories);
    } catch (error: unknown) {
      return this.handleError(res, error, LogEvents.TECH_CATEGORY_FETCH_FAILED);
    }
  };

  public getServices = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { categoryId } = req.query;
      const { page, limit, search } = RequestMapper.toPagination(req.query);

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
      return this.handleError(res, error, LogEvents.TECH_SERVICE_FETCH_FAILED);
    }
  };

  public getZones = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { page } = RequestMapper.toPagination(req.query);
      const params: ZoneQueryParams = { page, limit: 100, isActive: undefined };
      
      const result = await this._getAllZonesUseCase.execute(params);
      return this.ok(res, result.zones);
    } catch (error: unknown) {
      return this.handleError(res, error, LogEvents.TECH_ZONE_FETCH_FAILED);
    }
  };

  public getRateCard = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = this.getTechId(req);
      const rateCard = await this._getRateCardUseCase.execute(technicianId);

      return this.ok(res, rateCard);
    } catch (error: unknown) {
      // Reusing TECH_PROFILE_ERROR from existing constants as it matches profile-related data fetch
      return this.handleError(res, error, LogEvents.TECH_PROFILE_ERROR);
    }
  };
}