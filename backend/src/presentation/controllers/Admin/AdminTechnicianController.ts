import { Request, Response } from "express";
import { IUseCase } from "../../../application/interfaces/IUseCase";
import { PaginatedTechnicianQueueResponse } from "../../../application/dto/technician/TechnicianQueueDto";
import { AdminTechnicianProfileDto, VerifyTechnicianDto } from "../../../application/dto/technician/TechnicianVerificationDtos";

import { 
  TechnicianUpdatePayload, 
  TechnicianFilterParams, 
  VerificationQueueFilters 
} from "../../../domain/repositories/ITechnicianRepository";

import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages, SuccessMessages } from "../../../../../shared/types/enums/ErrorMessages"; 
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export class AdminTechnicianController {
  constructor(
    private readonly _getQueueUseCase: IUseCase<PaginatedTechnicianQueueResponse, [VerificationQueueFilters]>,
    private readonly _getFullProfileUseCase: IUseCase<AdminTechnicianProfileDto, [string]>, 
    private readonly _verifyTechnicianUseCase: IUseCase<void, [string, VerifyTechnicianDto]>, 
    private readonly _getAllTechniciansUseCase: IUseCase<PaginatedTechnicianQueueResponse, [TechnicianFilterParams & { page: number, limit: number }]>,
    private readonly _updateTechnicianUseCase: IUseCase<void, [string, TechnicianUpdatePayload]>,
    private readonly _deleteTechnicianUseCase: IUseCase<void, [string]>,
    private readonly _blockTechnicianUseCase: IUseCase<void, [string, boolean, string | undefined]>,
    
    private readonly _logger: ILogger
  ) {}

  // --- Phase 1: Queue ---
  getVerificationQueue = async (req: Request, res: Response): Promise<void> => {
    try {
      this._logger.info(LogEvents.ADMIN_GET_TECH_QUEUE_INIT, { query: req.query });

      const params: VerificationQueueFilters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string | undefined
      };

      const result = await this._getQueueUseCase.execute(params);

      res.status(StatusCodes.OK).json({
        success: true,
        data: result
      });

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this._logger.error(LogEvents.ADMIN_GET_TECH_QUEUE_FAILED, errorMessage, { error: err });
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };

  // --- Phase 2: Full Profile ---
  getTechnicianProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      this._logger.info(LogEvents.ADMIN_GET_TECH_PROFILE_INIT, { id });

      const result = await this._getFullProfileUseCase.execute(id);

      res.status(StatusCodes.OK).json({
        success: true,
        data: result
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this._logger.error(LogEvents.ADMIN_GET_TECH_PROFILE_FAILED, errorMessage, { id: req.params.id });
      
      if (errorMessage === ErrorMessages.TECHNICIAN_NOT_FOUND) {
        res.status(StatusCodes.NOT_FOUND).json({ error: errorMessage });
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
      }
    }
  };

  // --- Phase 2: Verify / Reject ---
  verifyTechnician = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const dto = req.body as VerifyTechnicianDto;
      
      this._logger.info(LogEvents.ADMIN_VERIFY_TECH_INIT, { id, action: dto.action });

      if (!dto.action || !["APPROVE", "REJECT"].includes(dto.action)) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid action. Must be APPROVE or REJECT." });
        return;
      }

      await this._verifyTechnicianUseCase.execute(id, dto);

      res.status(StatusCodes.OK).json({
        success: true,
        message: dto.action === "APPROVE" ? SuccessMessages.TECH_VERIFIED : SuccessMessages.TECH_REJECTED
      });

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this._logger.error(LogEvents.ADMIN_VERIFY_TECH_FAILED, errorMessage, { id: req.params.id });
      
      if (errorMessage === ErrorMessages.TECHNICIAN_NOT_FOUND) {
        res.status(StatusCodes.NOT_FOUND).json({ error: errorMessage });
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
      }
    }
  };

  // --- Phase 3: Get All Technicians (List View) ---
  getAllTechnicians = async (req: Request, res: Response): Promise<void> => {
    try {
      this._logger.info(LogEvents.ADMIN_GET_ALL_TECHS_INIT, { query: req.query });

      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string | undefined,
        status: req.query.status as any,
        zoneId: req.query.zoneId as string | undefined
      };

      const result = await this._getAllTechniciansUseCase.execute(filters); 

      res.status(StatusCodes.OK).json({
        success: true,
        data: result
      });

    } catch (err: unknown) {
      this._logger.error(LogEvents.ADMIN_GET_ALL_TECHS_FAILED, String(err));
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };

  // --- Phase 4: Management Actions ---

  // 1. Update Details
  updateTechnician = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updates = req.body as TechnicianUpdatePayload; 
      
      this._logger.info(LogEvents.ADMIN_UPDATE_TECH_INIT, { id, fields: Object.keys(updates) });

      await this._updateTechnicianUseCase.execute(id, updates);

      res.status(StatusCodes.OK).json({
        success: true,
        message: SuccessMessages.TECH_UPDATED
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this._logger.error(LogEvents.ADMIN_UPDATE_TECH_FAILED, errorMessage, { id: req.params.id });
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: errorMessage });
    }
  };

  // 2. Toggle Suspension
  toggleBlockTechnician = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { isSuspended, reason } = req.body;

      this._logger.info(LogEvents.ADMIN_BLOCK_TECH_INIT, { id, isSuspended });

      await this._blockTechnicianUseCase.execute(id, isSuspended, reason);

      res.status(StatusCodes.OK).json({
        success: true,
        message: isSuspended ? SuccessMessages.TECH_SUSPENDED : SuccessMessages.TECH_ACTIVATED
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this._logger.error(LogEvents.ADMIN_BLOCK_TECH_FAILED, errorMessage, { id: req.params.id });
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: errorMessage });
    }
  };

  // 3. Delete Technician
  deleteTechnician = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      this._logger.info(LogEvents.ADMIN_DELETE_TECH_INIT, { id });

      await this._deleteTechnicianUseCase.execute(id);

      res.status(StatusCodes.OK).json({
        success: true,
        message: SuccessMessages.TECH_DELETED
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this._logger.error(LogEvents.ADMIN_DELETE_TECH_FAILED, errorMessage, { id: req.params.id });
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: errorMessage });
    }
  };
}