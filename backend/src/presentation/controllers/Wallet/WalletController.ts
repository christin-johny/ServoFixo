import { Request, Response, NextFunction } from "express";
import { BaseController } from "../BaseController";
import { 
  IGetWalletDetailsUseCase, 
  IGetTransactionHistoryUseCase 
} from "../../../application/interfaces/use-cases/wallet/IWalletUseCases";
import { ILogger } from "../../../application/interfaces/services/ILogger";
import { WalletErrorMessages } from "../../../application/constants/ErrorMessages";

interface AuthenticatedRequest extends Request {
  userId?: string;
  role?: string;
}

export class WalletController extends BaseController {
  constructor(
    private readonly _getDetailsUseCase: IGetWalletDetailsUseCase,
    private readonly _getHistoryUseCase: IGetTransactionHistoryUseCase,
    logger:ILogger
  ) {
    super(logger);
  }
 
  getBalance = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try { 
      const { userId, role } = (req as AuthenticatedRequest);  
      
      if (!userId || role !== "technician") {
        return this.unauthorized(res);
      }

      const result = await this._getDetailsUseCase.execute(userId);
      return this.ok(res, result);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = WalletErrorMessages.WALLET_NOT_FOUND;
      next(err);
    }
  };

  getTransactions = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { userId, role } = (req as AuthenticatedRequest);
      
      if (!userId || role !== "technician") {
        return this.unauthorized(res);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this._getHistoryUseCase.execute(userId, page, limit);
      return this.ok(res, result);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = WalletErrorMessages.WALLET_NOT_FOUND;
      next(err);
    }
  };
}