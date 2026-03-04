import { Router } from "express";
import { adminPayoutController } from "../../../infrastructure/di/Container"; 

const router = Router();
 
router.get(
  "/",
  adminPayoutController.getPendingPayouts.bind(adminPayoutController)
);
 
router.patch(
  "/:id/status",
  adminPayoutController.updatePayoutStatus.bind(adminPayoutController)
);

router.post(
  "/trigger-batch",
  adminPayoutController.manuallyTriggerWeeklyBatch.bind(adminPayoutController)
);

export default router;