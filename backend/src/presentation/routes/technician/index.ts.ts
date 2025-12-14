import { Router } from "express";
import { JwtService } from "../../../infrastructure/security/JwtService";
import { makeTechnicianAuthMiddleware } from "../../middlewares/technicianAuth.middleware";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";

const router = Router();

const jwtService = new JwtService();

const technicianAuth = makeTechnicianAuthMiddleware(jwtService);

router.get("/me", technicianAuth, (req, res) => {
  const user = (req as any).user;

  return res.status(StatusCodes.OK).json({
    message: "Technician profile placeholder",
    user,
  });
});

export default router;
