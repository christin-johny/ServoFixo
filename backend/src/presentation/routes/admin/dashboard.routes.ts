import { Router } from "express";
import { dashboardController } from "../../../infrastructure/di/Container"; 

const router = Router();
 
router.get("/stats", dashboardController.getAdminStats.bind(dashboardController));

export default router;