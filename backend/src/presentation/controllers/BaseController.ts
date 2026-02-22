import { Response } from "express";
import { StatusCodes } from "../utils/StatusCodes";
import { ILogger } from "../../application/interfaces/ILogger";

export abstract class BaseController {
  constructor(protected readonly _logger: ILogger) {}

  // SUCCESS RESPONSES  

  protected ok<T>(res: Response, data: T, message?: string): Response {
    return res.status(StatusCodes.OK).json({
      success: true,
      message,
      data,
    });
  }

  protected created<T>(res: Response, data: T, message?: string): Response {
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message,
      data,
    });
  }

  // CLIENT ERROR RESPONSES (For early-exit validations before Use Cases)

  protected clientError(res: Response, message?: string): Response {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      error: message || "Bad Request",
    });
  }

  protected unauthorized(res: Response, message?: string): Response {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      error: message || "Unauthorized",
    });
  }

  protected forbidden(res: Response, message?: string): Response {
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      error: message || "Forbidden",
    });
  }

  protected notFound(res: Response, message?: string): Response {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      error: message || "Not Found",
    });
  }
}