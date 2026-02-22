import type { Request, Response, NextFunction } from "express";
import { IJwtService } from "../../application/interfaces/IJwtService";
import { ErrorMessages } from "../../application/constants/ErrorMessages";
import { StatusCodes } from "../utils/StatusCodes";

export function makeAdminAuthMiddleware(jwtService: IJwtService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers["authorization"];

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: ErrorMessages.UNAUTHORIZED,
        });
      }

      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          error: ErrorMessages.UNAUTHORIZED,
        });
      }

      const payload = await jwtService.verifyAccessToken(token);

      if (payload.type !== "admin") {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: ErrorMessages.FORBIDDEN,
        });
      }

      (req as any).user = payload;
      (req as any).userId = payload.sub; 
      (req as any).role = payload.type;

      return next();
    } catch{
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: ErrorMessages.UNAUTHORIZED,
      });
    }
  };
}
