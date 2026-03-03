import { Request, Response, NextFunction } from "express";
import { BaseController } from "../BaseController";
import { 
  IGetPendingPayoutsUseCase, 
  IApprovePayoutUseCase 
} from "../../../application/interfaces/use-cases/wallet/IPayoutUseCases"; 
import { ILogger } from "../../../application/interfaces/services/ILogger";


export class AdminPayoutController extends BaseController {
  constructor(
    private readonly _getPendingUseCase: IGetPendingPayoutsUseCase,
    private readonly _approveUseCase: IApprovePayoutUseCase,
    logger:ILogger
  ) {
    super(logger);
  }

  getPendingPayouts = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const result = await this._getPendingUseCase.execute();
      return this.ok(res, result);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = "ADMIN_GET_PENDING_PAYOUTS_FAILED";
      next(err);
    }
  };


  updatePayoutStatus = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const { action } = req.body;
      const adminId = (req as any).userId; 

      if (!id || !action) {
        return this.clientError(res, "Missing payout ID or action");
      }

      await this._approveUseCase.execute(id, action, adminId);
      
      return this.ok(res, { message: `Payout successfully ${action.toLowerCase()}d` });
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = "ADMIN_PAYOUT_STATUS_UPDATE_FAILED";
      next(err);
    }
  };
}