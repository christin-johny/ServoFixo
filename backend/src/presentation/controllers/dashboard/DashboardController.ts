import { Request, Response, NextFunction } from "express";
import { BaseController } from "../BaseController";
import { IGetAdminDashboardUseCase, IGetTechnicianDashboardUseCase } from "../../../application/interfaces/use-cases/dashboard/IDashboardUseCases";
import { ILogger } from "../../../application/interfaces/services/ILogger";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export class DashboardController extends BaseController {
  constructor(
    private readonly _getAdminDashboardUseCase: IGetAdminDashboardUseCase,
    private readonly _getTechnicianDashboardUseCase: IGetTechnicianDashboardUseCase,
    _logger: ILogger
  ) {
    super(_logger);
  }

  getAdminStats = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const stats = await this._getAdminDashboardUseCase.execute();
      return this.ok(res, stats, "Admin dashboard statistics retrieved successfully");
    } catch (err) {
      next(err);
    }
  };

  getTechnicianStats = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = (req as AuthenticatedRequest).userId;
      if (!technicianId) throw new Error("Unauthorized");

      const stats = await this._getTechnicianDashboardUseCase.execute(technicianId);
      return this.ok(res, stats, "Technician dashboard statistics retrieved successfully");
    } catch (err) {
      next(err);
    }
  };
}