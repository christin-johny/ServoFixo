import { Router } from "express";
import { adminTechnicianController } from "../../../infrastructure/di/Container"; 
import { JwtService } from "../../../infrastructure/security/JwtService";
import { makeAdminAuthMiddleware } from "../../middlewares/adminAuth.middleware";

const router = Router();
const jwtService = new JwtService();
const adminAuth = makeAdminAuthMiddleware(jwtService);

// 1. List (Queue)
router.get(
  "/queue", 
  adminAuth, 
  adminTechnicianController.getVerificationQueue.bind(adminTechnicianController)
);

// 2. Detail (Full Profile)
router.get(
  "/:id", 
  adminAuth, 
  adminTechnicianController.getTechnicianProfile.bind(adminTechnicianController)
);

// 3. Action (Verify/Reject)
router.patch(
  "/:id/verify", 
  adminAuth, 
  adminTechnicianController.verifyTechnician.bind(adminTechnicianController)
);

export default router;