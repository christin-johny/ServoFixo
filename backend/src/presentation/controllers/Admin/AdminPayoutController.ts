import { Request, Response, NextFunction } from "express";
import { BaseController } from "../BaseController";
import { 
  IGetPendingPayoutsUseCase, 
  IApprovePayoutUseCase, 
  IProcessWeeklyPayoutBatchUseCase
} from "../../../application/interfaces/use-cases/wallet/IPayoutUseCases"; 
import { ILogger } from "../../../application/interfaces/services/ILogger";


export class AdminPayoutController extends BaseController {
  constructor(
    private readonly _getPendingUseCase: IGetPendingPayoutsUseCase,
    private readonly _approveUseCase: IApprovePayoutUseCase,
    private readonly _generateWeeklyPayouts: IProcessWeeklyPayoutBatchUseCase,
    logger:ILogger
  ) {
    super(logger);
  }

  getPendingPayouts = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      // Grab the filters from the URL query
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const status = req.query.status as string;

      // Pass them into the upgraded Use Case
      const result = await this._getPendingUseCase.execute({ page, limit, search, status });
      
      return this.ok(res, result);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = "ADMIN_GET_PAYOUTS_FAILED";
      next(err);
    }
  };


  updatePayoutStatus = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const { action, referenceId } = req.body; // THE FIX: Extract referenceId
      const adminId = (req as any).userId; 

      if (!id || !action) {
        return this.clientError(res, "Missing payout ID or action");
      }

      // THE FIX: Pass referenceId to the Use Case
      await this._approveUseCase.execute(id, action, adminId, referenceId);
      
      return this.ok(res, { message: `Payout successfully ${action.toLowerCase()}d` });
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = "ADMIN_PAYOUT_STATUS_UPDATE_FAILED";
      next(err);
    }
  };


manuallyTriggerWeeklyBatch = async (req: Request, res: Response) => {
  try { 
    const result = await this._generateWeeklyPayouts.execute(); 
    
    res.status(200).json({
      status: "success",
      message: "Weekly batch triggered manually for testing",
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
}