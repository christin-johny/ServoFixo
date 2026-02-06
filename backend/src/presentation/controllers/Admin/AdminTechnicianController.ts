// src/presentation/controllers/admin/AdminTechnicianController.ts

import { Request, Response } from "express";
import { BaseController } from "../BaseController";
import { RequestMapper } from "../../utils/RequestMapper";
import { IUseCase } from "../../../application/interfaces/IUseCase";
import { PaginatedTechnicianQueueResponse } from "../../../application/dto/technician/TechnicianQueueDto";
import {
  AdminTechnicianProfileDto,
  VerifyTechnicianDto,
} from "../../../application/dto/technician/TechnicianVerificationDtos";
import { ResolvePartnerRequestDto } from "../../../application/dto/admin/ManageRequestDto";
import {
  TechnicianUpdatePayload,
  TechnicianFilterParams,
  VerificationQueueFilters,
  QueueType,
} from "../../../domain/repositories/ITechnicianRepository"; 
import { SuccessMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";
import { RequestAction, PartnerRequestType } from "../../../../../shared/types/enums/RequestResolutionEnums";
import { GetRecommendedTechniciansDto } from "../../../application/use-cases/booking/GetRecommendedTechniciansUseCase";  

export class AdminTechnicianController extends BaseController {
  constructor(
    private readonly _getQueueUseCase: IUseCase<PaginatedTechnicianQueueResponse, [VerificationQueueFilters]>,
    private readonly _getFullProfileUseCase: IUseCase<AdminTechnicianProfileDto, [string]>,
    private readonly _verifyTechnicianUseCase: IUseCase<void, [string, VerifyTechnicianDto]>,
    private readonly _getAllTechniciansUseCase: IUseCase<PaginatedTechnicianQueueResponse, [TechnicianFilterParams & { page: number; limit: number }]>,
    private readonly _updateTechnicianUseCase: IUseCase<void, [string, TechnicianUpdatePayload]>,
    private readonly _deleteTechnicianUseCase: IUseCase<void, [string]>,
    private readonly _blockTechnicianUseCase: IUseCase<void, [string, boolean, string | undefined]>,
    private readonly _resolveServiceRequestUseCase: IUseCase<void, [string, ResolvePartnerRequestDto]>,
    private readonly _resolveZoneRequestUseCase: IUseCase<void, [string, ResolvePartnerRequestDto]>,
    private readonly _resolveBankRequestUseCase: IUseCase<void, [string, ResolvePartnerRequestDto]>,
    private readonly _getRecommendedTechniciansUseCase: IUseCase<any[], [GetRecommendedTechniciansDto]>,
    _logger: ILogger 
  ) {
    super(_logger);
  }

  getVerificationQueue = async (req: Request, res: Response): Promise<Response> => {
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
      return this.handleError(res, err, LogEvents.ADMIN_GET_TECH_QUEUE_FAILED);
    }
  };

  getTechnicianProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await this._getFullProfileUseCase.execute(req.params.id);
      return this.ok(res, result);
    } catch (err) {
      return this.handleError(res, err, LogEvents.PROFILE_FETCH_FAILED);
    }
  };

  verifyTechnician = async (req: Request, res: Response): Promise<Response> => {
    try {
      const dto = req.body as VerifyTechnicianDto;
      await this._verifyTechnicianUseCase.execute(req.params.id, dto);

      const message = dto.action === "APPROVE" 
        ? "Technician Approved Successfully" 
        : "Technician Rejected";
        
      return this.ok(res, null, message);
    } catch (err) {
      return this.handleError(res, err, LogEvents.ADMIN_RESOLVE_PARTNER_REQUEST_FAILED);
    }
  };

  getAllTechnicians = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { page, limit, search } = RequestMapper.toPagination(req.query);
      const zoneId = req.query.zoneId as string;
      const serviceId = req.query.serviceId as string;

      //   SMART MODE: Use the Use Case
      if (zoneId && serviceId) {
           const techs = await this._getRecommendedTechniciansUseCase.execute({
               zoneId,
               serviceId,
               search
           });

           // Map to simple list for Modal
           const data = techs.map((tech: any) => ({
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

      // ❌ NORMAL MODE: Browse All
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
      return this.handleError(res, err, "GET_ALL_TECHS_FAILED");
    }
  };


  updateTechnician = async (req: Request, res: Response): Promise<Response> => {
    try {
      await this._updateTechnicianUseCase.execute(req.params.id, req.body);
      return this.ok(res, null, SuccessMessages.TECH_UPDATED);
    } catch (err) {
      return this.handleError(res, err, LogEvents.CATEGORY_UPDATE_FAILED);  
    }
  };

  toggleBlockTechnician = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { isSuspended, reason } = req.body;
      await this._blockTechnicianUseCase.execute(req.params.id, isSuspended, reason);

      return this.ok(res, null, isSuspended ? SuccessMessages.TECH_SUSPENDED : SuccessMessages.TECH_ACTIVATED);
    } catch (err) {
      return this.handleError(res, err, LogEvents.ADMIN_RESOLVE_PARTNER_REQUEST_FAILED);
    }
  };

  deleteTechnician = async (req: Request, res: Response): Promise<Response> => {
    try {
      await this._deleteTechnicianUseCase.execute(req.params.id);
      return this.ok(res, null, SuccessMessages.TECH_DELETED);
    } catch (err) {
      return this.handleError(res, err, LogEvents.CATEGORY_DELETE_FAILED);
    }
  };

  resolvePartnerRequest = async (req: Request, res: Response): Promise<Response> => {
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
      return this.handleError(res, err, LogEvents.ADMIN_RESOLVE_PARTNER_REQUEST_FAILED);
    }
  };
}