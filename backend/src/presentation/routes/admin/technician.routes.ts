import { Router } from "express";
import { adminTechnicianController } from "../../../infrastructure/di/Container"; 
import { JwtService } from "../../../infrastructure/security/JwtService";
import { makeAdminAuthMiddleware } from "../../middlewares/adminAuth.middleware";

const router = Router();
const jwtService = new JwtService();
const adminAuth = makeAdminAuthMiddleware(jwtService);

router.get(
  "/queue", 
  adminAuth, 
  adminTechnicianController.getVerificationQueue.bind(adminTechnicianController)
);

router.get(
  "/", 
  adminAuth, 
  adminTechnicianController.getAllTechnicians.bind(adminTechnicianController)
);

router.get(
  "/:id", 
  adminAuth, 
  adminTechnicianController.getTechnicianProfile.bind(adminTechnicianController)
);

router.patch(
  "/:id/verify", 
  adminAuth, 
  adminTechnicianController.verifyTechnician.bind(adminTechnicianController)
);
router.patch(
  "/:id/block", 
  adminAuth, 
  adminTechnicianController.toggleBlockTechnician.bind(adminTechnicianController)
);

export default router;