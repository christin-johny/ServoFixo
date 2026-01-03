import { Router } from "express";
import { technicianProfileController } from "../../../infrastructure/di/Container"; 

const router = Router();

router.get(
  "/onboarding/status", 
  technicianProfileController.getOnboardingStatus.bind(technicianProfileController)
);

export default router;