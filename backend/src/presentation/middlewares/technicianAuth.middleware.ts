import type { Request, Response, NextFunction } from "express";
import { IJwtService } from "../../application/services/IJwtService";
import { ErrorMessages } from "../../../../shared/types/enums/ErrorMessages";
import { StatusCodes } from "../../../../shared/types/enums/StatusCodes";

export function makeTechnicianAuthMiddleware(jwtService: IJwtService) {
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

      if (payload.type !== "technician") {
        return res.status(StatusCodes.FORBIDDEN).json({
          error: ErrorMessages.FORBIDDEN,
        });
      }

      (req as any).user = payload;

      return next();
    } catch (err) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: ErrorMessages.UNAUTHORIZED,
      });
    }
  };
}
