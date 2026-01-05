import { Router } from "express";
import { adminTechnicianController } from "../../../infrastructure/di/Container"; 
import { JwtService } from "../../../infrastructure/security/JwtService";
import { makeAdminAuthMiddleware } from "../../middlewares/adminAuth.middleware";

const router = Router();
const jwtService = new JwtService();
const adminAuth = makeAdminAuthMiddleware(jwtService);

// 1. List (Queue) - Pending Verification Only
router.get(
  "/queue", 
  adminAuth, 
  adminTechnicianController.getVerificationQueue.bind(adminTechnicianController)
);

// 2. Master List (Database) - All Technicians (Verified/Rejected/Etc)
// ✅ NEW ROUTE FOR PHASE 3
router.get(
  "/", 
  adminAuth, 
  adminTechnicianController.getAllTechnicians.bind(adminTechnicianController)
);

// 3. Detail (Full Profile)
// (Must come after specific routes like /queue to avoid conflicts, though /queue is distinct)
router.get(
  "/:id", 
  adminAuth, 
  adminTechnicianController.getTechnicianProfile.bind(adminTechnicianController)
);

// 4. Action (Verify/Reject)
router.patch(
  "/:id/verify", 
  adminAuth, 
  adminTechnicianController.verifyTechnician.bind(adminTechnicianController)
);

export default router;