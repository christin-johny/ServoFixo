import { Router } from "express";
import { technicianDataController } from "../../../infrastructure/di/Container"; 

const router = Router();

router.get("/categories", technicianDataController.getCategories.bind(technicianDataController));
router.get("/services", technicianDataController.getServices.bind(technicianDataController));
router.get("/zones", technicianDataController.getZones.bind(technicianDataController));
router.get("/rate-card", technicianDataController.getRateCard.bind(technicianDataController));

export default router;