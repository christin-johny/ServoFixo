import { Request, Response } from "express";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { ILogger } from "../../../application/interfaces/ILogger";
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

  getNotifications = async (req: Request, res: Response): Promise<Response> => {
    try {
      const techId = (req as AuthenticatedRequest).userId;

      // 🛑 Fix: Explicitly check for techId to satisfy TypeScript strictness
      if (!techId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: ErrorMessages.UNAUTHORIZED });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this._getHistoryUseCase.execute({
        recipientId: techId, // Now guaranteed to be a string
        page,
        limit
      });

      return res.status(StatusCodes.OK).json({
        success: true,
        data: result
      });
    } catch (error) {
      this._logger.error("Failed to fetch notification history", `${error}`);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        error: ErrorMessages.INTERNAL_ERROR 
      });
    }
  };

  markAsRead = async (req: Request, res: Response): Promise<Response> => {
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
      this._logger.error("Failed to mark notification as read", `${error}`);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        error: ErrorMessages.INTERNAL_ERROR 
      });
    }
  };
  markAllAsRead = async (req: Request, res: Response): Promise<Response> => {
    try {
      const techId = (req as AuthenticatedRequest).userId;
      if (!techId) return res.status(StatusCodes.UNAUTHORIZED).json({ error: ErrorMessages.UNAUTHORIZED });

      await this._markAllAsReadUseCase.execute(techId);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "All notifications marked as read"
      });
    } catch (error) {
      this._logger.error("Failed to mark all as read", `${error}`);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };
}