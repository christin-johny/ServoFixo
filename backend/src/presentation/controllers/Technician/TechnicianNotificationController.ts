import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "../../utils/StatusCodes";
import { ErrorMessages } from "../../../application/constants/ErrorMessages";
import { ILogger } from "../../../application/interfaces/services/ILogger";
import { GetNotificationHistoryUseCase } from "../../../application/use-cases/notification/GetNotificationHistoryUseCase";
import { MarkNotificationAsReadUseCase } from "../../../application/use-cases/notification/MarkNotificationAsReadUseCase";
import { MarkAllNotificationsAsReadUseCase } from "../../../application/use-cases/notification/MarkAllNotificationsAsReadUseCase";

interface AuthenticatedRequest extends Request {
  userId?: string;  
}

export class TechnicianNotificationController {
  constructor(
    private readonly _getHistoryUseCase: GetNotificationHistoryUseCase,
    private readonly _markAsReadUseCase: MarkNotificationAsReadUseCase, 
    private readonly _markAllAsReadUseCase: MarkAllNotificationsAsReadUseCase, 
    private readonly _logger: ILogger
  ) {}

  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const techId = (req as AuthenticatedRequest).userId;

      if (!techId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: ErrorMessages.UNAUTHORIZED });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this._getHistoryUseCase.execute({
        recipientId: techId, 
        page,
        limit
      });

      return res.status(StatusCodes.OK).json({
        success: true,
        data: result
      });
    } catch (error) {
      (error as Error & { logContext?: string }).logContext = "FETCH_NOTIFICATION_HISTORY_FAILED";
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const { notificationId } = req.params;
      const techId = (req as AuthenticatedRequest).userId;

      if (!techId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: ErrorMessages.UNAUTHORIZED });
      }

      await this._markAsReadUseCase.execute(notificationId);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Notification marked as read"
      });
    } catch (error) {
      (error as Error & { logContext?: string }).logContext = "MARK_NOTIFICATION_READ_FAILED";
      next(error);
    }
  };

  markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const techId = (req as AuthenticatedRequest).userId;
      if (!techId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: ErrorMessages.UNAUTHORIZED });
      }

      await this._markAllAsReadUseCase.execute(techId);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "All notifications marked as read"
      });
    } catch (error) {
      (error as Error & { logContext?: string }).logContext = "MARK_ALL_NOTIFICATIONS_READ_FAILED";
      next(error);
    }
  };
}