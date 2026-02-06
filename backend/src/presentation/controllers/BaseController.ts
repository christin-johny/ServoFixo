import { Response } from "express";
import { StatusCodes } from "../../../../shared/types/enums/StatusCodes";
import { ErrorMessages } from "../../../../shared/types/enums/ErrorMessages";
import { ILogger } from "../../application/interfaces/ILogger";

export abstract class BaseController {
  constructor(protected readonly _logger: ILogger) {}

  // SUCCESS RESPONSES  

  protected ok<T>(res: Response, data: T, message?: string) {
    return res.status(StatusCodes.OK).json({
      success: true,
      message,
      data,
    });
  }

  protected created<T>(res: Response, data: T, message?: string) {
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message,
      data,
    });
  }
 

  protected clientError(res: Response, message?: string) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: message || "Bad Request",
    });
  }

  protected unauthorized(res: Response, message?: string) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: message || "Unauthorized",
    });
  }

  protected forbidden(res: Response, message?: string) {
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      error: message || "Forbidden",
    });
  }

  protected notFound(res: Response, message?: string) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      error: message || "Not Found",
    });
  }

  //  SERVER ERROR RESPONSES 

  protected fail(res: Response, error: Error | string) {
    const message = error instanceof Error ? error.message : error;
    this._logger.error(`[ControllerError]: ${message}`);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ErrorMessages.INTERNAL_ERROR,
    });
  }

  //  HANDLING CAUGHT ERRORS 

  protected handleError(res: Response, err: unknown, eventLog: string) {
    const message = err instanceof Error ? err.message : String(err);
    this._logger.error(`${eventLog}: ${message}`);
 
    if (Object.values(ErrorMessages).includes(message as ErrorMessages)) {
      const status = this.getErrorCode(message);
      return res.status(status).json({ success: false, error: message });
    }
 
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: ErrorMessages.INTERNAL_ERROR,
    });
  }

  private getErrorCode(message: string): number {
    if (message.includes("NOT_FOUND")) return StatusCodes.NOT_FOUND;
    if (message.includes("UNAUTHORIZED")) return StatusCodes.UNAUTHORIZED;
    if (message.includes("ALREADY_EXISTS")) return StatusCodes.CONFLICT;
    if (message === ErrorMessages.INVALID_CREDENTIALS) return StatusCodes.UNAUTHORIZED;
    return StatusCodes.BAD_REQUEST;
  }
}