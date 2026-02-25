import { Request, Response, NextFunction } from "express";
import { BaseController } from "../BaseController";
import { ILogger } from "../../../application/interfaces/services/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents"; 
import { ErrorMessages,SuccessMessages } from "../../../application/constants/ErrorMessages";
import { 
  IStartChatSessionUseCase, 
  ISendChatMessageUseCase, 
  IGetChatHistoryUseCase,
  IResolveChatUseCase
} from "../../../application/interfaces/use-cases/chat/IChatUseCases";
 
interface AuthenticatedRequest extends Request {
  userId?: string;
  role?: string;
}

export class ChatController extends BaseController {
  constructor(
    private readonly _startSessionUseCase: IStartChatSessionUseCase,
    private readonly _sendMessageUseCase: ISendChatMessageUseCase,
    private readonly _getHistoryUseCase: IGetChatHistoryUseCase,
    private readonly _resolveChatUseCase: IResolveChatUseCase,
    _logger: ILogger  
  ) {
    super(_logger);
  }

  public startSession = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { userId, role } = req as AuthenticatedRequest;
      
      if (!userId || role !== "customer") {
        return this.forbidden(res, ErrorMessages.UNAUTHORIZED);
      }

      const response = await this._startSessionUseCase.execute(userId);
      
      return this.created(res, response, SuccessMessages.CHAT_SESSION_STARTED);
      
    } catch (err: unknown) {
      const error = err as Error & { logContext?: string };
      error.logContext = LogEvents.CHAT_SESSION_START_FAILED;
      next(error);
    }
  };

  public sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { userId, role } = req as AuthenticatedRequest;
      
      if (!userId || role !== "customer") {
        return this.forbidden(res, ErrorMessages.UNAUTHORIZED );
      }

      const { sessionId } = req.params;
      const message = req.body.message as string | undefined;

      if (!message || message.trim() === "") {
        return this.clientError(res, ErrorMessages.EMPTY_CHAT_MESSAGE);
      }

      const response = await this._sendMessageUseCase.execute(userId, sessionId, message);
      
      return this.ok(res, response, SuccessMessages.CHAT_MESSAGE_SENT);
      
    } catch (err: unknown) {
      const error = err as Error & { logContext?: string };
      error.logContext = LogEvents.CHAT_MESSAGE_SEND_FAILED;
      next(error);
    }
  };

  public getHistory = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { userId, role } = req as AuthenticatedRequest;
      
      if (!userId || role !== "customer") {
        return this.forbidden(res, ErrorMessages.UNAUTHORIZED);
      }

      const history = await this._getHistoryUseCase.execute(userId);
      
      return this.ok(res, history, SuccessMessages.CHAT_HISTORY_RETRIEVED);
      
    } catch (err: unknown) {
      const error = err as Error & { logContext?: string };
      error.logContext = LogEvents.CHAT_HISTORY_FETCH_FAILED;
      next(error);
    }
  };

  public resolveChat = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { userId, role } = req as AuthenticatedRequest;
      
      if (!userId || role !== "customer") {
        return this.forbidden(res, ErrorMessages.UNAUTHORIZED);
      }

      const { sessionId } = req.params;
      const resolutionType = req.body.resolutionType as string | undefined;

      if (resolutionType !== "RESOLVED" && resolutionType !== "ESCALATED_TO_BOOKING") {
        return this.clientError(res, ErrorMessages.INVALID_RESOLUTION_TYPE);
      }

      await this._resolveChatUseCase.execute(userId, sessionId, resolutionType);
      
      return this.ok(res, null, SuccessMessages.CHAT_SESSION_CLOSED);
      
    } catch (err: unknown) {
      const error = err as Error & { logContext?: string };
      error.logContext = LogEvents.CHAT_RESOLUTION_FAILED;
      next(error);
    }
  };
}