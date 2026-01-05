import { Request, Response } from 'express';
import { IUseCase } from '../../../application/interfaces/IUseCase';
import { StatusCodes } from '../../../../../shared/types/enums/StatusCodes';
import { ILogger } from '../../../application/interfaces/ILogger';

import { CategoryQueryParams } from '../../../domain/repositories/IServiceCategoryRepository';
import { PaginatedCategoriesResponse } from '../../../application/use-cases/service-categories/GetAllCategoriesUseCase';
import { ZoneQueryParams } from '../../../domain/repositories/IZoneRepository';
import { PaginatedZonesResponse } from '../../../application/use-cases/zones/GetAllZonesUseCase';
import { LogEvents } from "../../../../../shared/constants/LogEvents";
import { RateCardItem } from '../../../application/use-cases/technician/profile/GetTechnicianRateCardUseCase';
import { ErrorMessages } from '../../../../../shared/types/enums/ErrorMessages';

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

export class TechnicianDataController {
  constructor(
    private readonly _getAllCategoriesUseCase: IUseCase<PaginatedCategoriesResponse, [CategoryQueryParams]>,
    private readonly _getServiceListingUseCase: IUseCase<unknown[], [ServiceFilters]>,
    private readonly _getAllZonesUseCase: IUseCase<PaginatedZonesResponse, [ZoneQueryParams]>,
    private readonly _getRateCardUseCase: IUseCase<RateCardItem[], [string]>,
    private readonly _logger: ILogger
  ) {}

  public getCategories = async (req: Request, res: Response): Promise<Response> => {
    try {
      const params: CategoryQueryParams = { isActive: undefined, page: 1, limit: 100 };
      const result = await this._getAllCategoriesUseCase.execute(params);
      
      return res.status(StatusCodes.OK).json({ success: true, data: result.categories });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this._logger.error(LogEvents.TECH_CATEGORY_FETCH_FAILED, msg);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false });
    }
  };

  public getServices = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { categoryId } = req.query;
      const filters: ServiceFilters = {
        searchTerm: "",
        categoryId: categoryId as string,
        page: 1,
        limit: 100,
        isActive: undefined, 
      };

      const services = await this._getServiceListingUseCase.execute(filters);
      return res.status(StatusCodes.OK).json({ success: true, data: services });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this._logger.error(LogEvents.TECH_SERVICE_FETCH_FAILED, msg);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false });
    }
  };

  public getZones = async (req: Request, res: Response): Promise<Response> => {
    try {
      const params: ZoneQueryParams = { page: 1, limit: 100, isActive: undefined };
      const result = await this._getAllZonesUseCase.execute(params);
      
      return res.status(StatusCodes.OK).json({ success: true, data: result.zones });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this._logger.error(LogEvents.TECH_ZONE_FETCH_FAILED, msg);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false });
    }
  };

  public getRateCard = async (req: Request, res: Response): Promise<Response> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const technicianId = authReq.userId;

      if (!technicianId) {
         return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: ErrorMessages.UNAUTHORIZED });
      }

      const rateCard = await this._getRateCardUseCase.execute(technicianId);

      return res.status(StatusCodes.OK).json({ 
        success: true, 
        data: rateCard 
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this._logger.error(LogEvents.TECH_PROFILE_ERROR, `Rate Card Error: ${msg}`);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to calculate rate card' });
    }
  };
}