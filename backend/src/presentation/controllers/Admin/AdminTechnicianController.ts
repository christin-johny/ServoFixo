import { Request, Response } from "express";
import { IUseCase } from "../../../application/interfaces/IUseCase";
// DTOs
import { PaginatedTechnicianQueueResponse } from "../../../application/dto/technician/TechnicianQueueDto";
import { AdminTechnicianProfileDto, VerifyTechnicianDto } from "../../../application/dto/technician/TechnicianVerificationDtos";
// Params
import { VerificationQueueFilters, TechnicianFilterParams } from "../../../domain/repositories/ITechnicianRepository";
// Utils
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages"; 
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export class AdminTechnicianController {
  constructor(
    private readonly _getQueueUseCase: IUseCase<PaginatedTechnicianQueueResponse, [VerificationQueueFilters]>,
    private readonly _getFullProfileUseCase: IUseCase<AdminTechnicianProfileDto, [string]>, 
    private readonly _verifyTechnicianUseCase: IUseCase<void, [string, VerifyTechnicianDto]>, 
    // ✅ ADDED THIS MISSING INJECTION
    private readonly _getAllTechniciansUseCase: IUseCase<PaginatedTechnicianQueueResponse, [TechnicianFilterParams & { page: number, limit: number }]>,
    private readonly _logger: ILogger
  ) {}

  // --- Phase 1: Queue ---
  getVerificationQueue = async (req: Request, res: Response): Promise<Response> => {
    try {
      this._logger.info(LogEvents.ADMIN_GET_TECH_QUEUE_INIT, { query: req.query });

      const params: VerificationQueueFilters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string | undefined
      };

      const result = await this._getQueueUseCase.execute(params);

      return res.status(StatusCodes.OK).json({
        success: true,
        data: result
      });

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this._logger.error(LogEvents.ADMIN_GET_TECH_QUEUE_FAILED, errorMessage, { error: err });
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };

  // --- Phase 2: Full Profile ---
  getTechnicianProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const result = await this._getFullProfileUseCase.execute(id);

      return res.status(StatusCodes.OK).json({
        success: true,
        data: result
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      if (errorMessage === ErrorMessages.TECHNICIAN_NOT_FOUND) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: errorMessage });
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };

  // --- Phase 2: Verify / Reject ---
  verifyTechnician = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const dto = req.body as VerifyTechnicianDto;

      if (!dto.action || !["APPROVE", "REJECT"].includes(dto.action)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid action. Must be APPROVE or REJECT." });
      }

      await this._verifyTechnicianUseCase.execute(id, dto);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: dto.action === "APPROVE" ? "Technician Approved Successfully" : "Technician Rejected"
      });

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      
      if (errorMessage === ErrorMessages.TECHNICIAN_NOT_FOUND) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: errorMessage });
      }

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };

  // --- Phase 3: Get All Technicians (List View) ---
  getAllTechnicians = async (req: Request, res: Response): Promise<Response> => {
    try {
      this._logger.info("ADMIN_GET_ALL_TECHS_INIT", { query: req.query });

      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string | undefined,
        status: req.query.status as any,
        zoneId: req.query.zoneId as string | undefined
      };

      // ✅ Now this works because we injected it in constructor
      const result = await this._getAllTechniciansUseCase.execute(filters); 

      return res.status(StatusCodes.OK).json({
        success: true,
        data: result
      });

    } catch (err: unknown) {
      this._logger.error("ADMIN_GET_ALL_TECHS_FAILED", String(err));
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };
}