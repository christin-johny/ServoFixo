import { NextFunction, Request, Response } from "express";
import { BaseController } from "../BaseController";
import { RequestMapper } from "../../utils/RequestMapper"; 
import { 
  VerifyTechnicianDto,
} from "../../../application/dto/technician/TechnicianVerificationDtos";
import { ResolvePartnerRequestDto } from "../../../application/dto/admin/ManageRequestDto";
import { 
  VerificationQueueFilters,
  QueueType,
} from "../../../domain/repositories/ITechnicianRepository"; 
import { SuccessMessages } from "../../../application/constants/ErrorMessages";
import { ILogger } from "../../../application/interfaces/services/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { RequestAction, PartnerRequestType } from "../../../domain/enums/RequestResolutionEnums";
 import { IGetRecommendedTechniciansUseCase } from "../../../application/interfaces/use-cases/booking/IBookingUseCases";
import { IVerifyTechnicianUseCase, IGetAllTechniciansUseCase, IUpdateTechnicianUseCase, IDeleteTechnicianUseCase, IBlockTechnicianUseCase, IResolveServiceRequestUseCase, IResolveZoneRequestUseCase, IResolveBankRequestUseCase, IGetVerificationQueueUseCase } from "../../../application/interfaces/use-cases/technician/ITechnicianManagementUseCases";
import { IGetTechnicianFullProfileUseCase } from "../../../application/interfaces/use-cases/technician/ITechnicianProfileUseCases";
import { Technician } from "../../../domain/entities/Technician";

export class AdminTechnicianController extends BaseController {
  constructor(
    private readonly _getQueueUseCase: IGetVerificationQueueUseCase,
    private readonly _getFullProfileUseCase: IGetTechnicianFullProfileUseCase,
    private readonly _verifyTechnicianUseCase: IVerifyTechnicianUseCase,
    private readonly _getAllTechniciansUseCase: IGetAllTechniciansUseCase,
    private readonly _updateTechnicianUseCase: IUpdateTechnicianUseCase,
    private readonly _deleteTechnicianUseCase: IDeleteTechnicianUseCase,
    private readonly _blockTechnicianUseCase: IBlockTechnicianUseCase,
    private readonly _resolveServiceRequestUseCase: IResolveServiceRequestUseCase,
    private readonly _resolveZoneRequestUseCase: IResolveZoneRequestUseCase,
    private readonly _resolveBankRequestUseCase: IResolveBankRequestUseCase,
    private readonly _getRecommendedTechniciansUseCase: IGetRecommendedTechniciansUseCase,
    _logger: ILogger 
  ) {
    super(_logger);
  }

  getVerificationQueue = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { page, limit, search } = RequestMapper.toPagination(req.query);
      const params: VerificationQueueFilters = {
        page,
        limit,
        search,
        type: req.query.type as QueueType | undefined,
        sort: (req.query.sort as "asc" | "desc") || "asc",
        sortBy: (req.query.sortBy as string) || "submittedAt",
      };

      const result = await this._getQueueUseCase.execute(params);
      return this.ok(res, result);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.ADMIN_GET_TECH_QUEUE_FAILED;
      next(err);
    }
  };

  getTechnicianProfile = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const result = await this._getFullProfileUseCase.execute(req.params.id);
      return this.ok(res, result);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.PROFILE_FETCH_FAILED;
      next(err);
    }
  };

  verifyTechnician = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const dto = req.body as VerifyTechnicianDto;
      await this._verifyTechnicianUseCase.execute(req.params.id, dto);

      const message = dto.action === "APPROVE" 
        ? "Technician Approved Successfully" 
        : "Technician Rejected";
        
      return this.ok(res, null, message);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.ADMIN_RESOLVE_PARTNER_REQUEST_FAILED;
      next(err);
    }
  };

  getAllTechnicians = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { page, limit, search } = RequestMapper.toPagination(req.query);
      const zoneId = req.query.zoneId as string;
      const serviceId = req.query.serviceId as string;

      if (zoneId && serviceId) {
           const techs = await this._getRecommendedTechniciansUseCase.execute({
               zoneId,
               serviceId,
               search
           });

           const data = techs.map((tech: Technician) => ({
                id: tech.getId(),
                name: tech.getName(),
                phone: tech.getPhone(),
                avatarUrl: tech.getAvatarUrl(),
                isOnline: tech.getIsOnline(),
                availabilityStatus: tech.getAvailability().isOnJob ? "BUSY" : "AVAILABLE",
                rating: tech.getRatings().averageRating
           }));

           return this.ok(res, { data, total: data.length });
      } 

      const filters = {
        page,
        limit,
        search,
        status: req.query.status as any,
        zoneId: req.query.zoneId as string | undefined,
      };

      const result = await this._getAllTechniciansUseCase.execute(filters);
      return this.ok(res, result);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = "GET_ALL_TECHS_FAILED";
      next(err);
    }
  };

  updateTechnician = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      await this._updateTechnicianUseCase.execute(req.params.id, req.body);
      return this.ok(res, null, SuccessMessages.TECH_UPDATED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.CATEGORY_UPDATE_FAILED;  
      next(err);
    }
  };

  toggleBlockTechnician = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { isSuspended, reason } = req.body;
      await this._blockTechnicianUseCase.execute(req.params.id, isSuspended, reason);

      return this.ok(res, null, isSuspended ? SuccessMessages.TECH_SUSPENDED : SuccessMessages.TECH_ACTIVATED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.ADMIN_RESOLVE_PARTNER_REQUEST_FAILED;
      next(err);
    }
  };

  deleteTechnician = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      await this._deleteTechnicianUseCase.execute(req.params.id);
      return this.ok(res, null, SuccessMessages.TECH_DELETED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.CATEGORY_DELETE_FAILED;
      next(err);
    }
  };

  resolvePartnerRequest = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const dto = req.body as ResolvePartnerRequestDto;
      
      const routes = {
        [PartnerRequestType.SERVICE]: this._resolveServiceRequestUseCase,
        [PartnerRequestType.ZONE]: this._resolveZoneRequestUseCase,
        [PartnerRequestType.BANK]: this._resolveBankRequestUseCase,
      };

      const useCase = routes[dto.requestType];
      if (!useCase) throw new Error("Invalid request type");

      await useCase.execute(req.params.id, dto);

      const message = dto.action === RequestAction.APPROVE
        ? "Request approved and technician notified."
        : "Request rejected and technician notified.";

      return this.ok(res, null, message);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.ADMIN_RESOLVE_PARTNER_REQUEST_FAILED;
      next(err);
    }
  };
}