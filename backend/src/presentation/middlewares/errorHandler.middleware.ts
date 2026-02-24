import { Request, Response, NextFunction } from "express";
import { ILogger } from "../../application/interfaces/services/ILogger";
import { StatusCodes } from "../utils/StatusCodes";
import { ErrorMessages } from "../../application/constants/ErrorMessages";
 
export interface CustomError extends Error {
  statusCode?: number;
  logContext?: string;
  code?: number; 
}

// Helper function to map string messages to HTTP Status Codes
const getErrorCode = (message: string): number => {
  if (typeof message !== "string") return StatusCodes.INTERNAL_SERVER_ERROR;
  if (message.includes("NOT_FOUND")) return StatusCodes.NOT_FOUND;
  if (message.includes("UNAUTHORIZED")) return StatusCodes.UNAUTHORIZED;
  if (message.includes("ALREADY_EXISTS")) return StatusCodes.CONFLICT;
  if (message === ErrorMessages.INVALID_CREDENTIALS) return StatusCodes.UNAUTHORIZED;
  return StatusCodes.BAD_REQUEST;
};

export const makeErrorHandlerMiddleware = (logger: ILogger) => {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    err: any,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
  ): void => {
    const customErr = err as CustomError;
 
    const statusCode = customErr.statusCode || getErrorCode(customErr.message) || StatusCodes.INTERNAL_SERVER_ERROR;
    const message = customErr.message || ErrorMessages.INTERNAL_ERROR;
     
    const logContext = customErr.logContext || "UNHANDLED_ERROR";
 
    if (statusCode === StatusCodes.INTERNAL_SERVER_ERROR) { 
      const stackInfo = customErr.stack ? ` \nStack: ${customErr.stack}` : "";
      logger.error(`[${logContext}]: ${message}${stackInfo}`);
    } else {
      logger.error(`[${logContext}]: ${message}`);
    }
 
    res.status(statusCode).json({
      success: false,
      error: message,
    });
  };
};