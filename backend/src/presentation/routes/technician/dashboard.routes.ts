import { Router } from "express";
import { dashboardController } from "../../../infrastructure/di/Container"; 

const router = Router();
 
router.get("/stats", dashboardController.getTechnicianStats.bind(dashboardController));

export default router;