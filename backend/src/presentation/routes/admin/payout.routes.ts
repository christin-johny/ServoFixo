import { Router } from "express";
import { adminPayoutController } from "../../../infrastructure/di/Container"; 

const router = Router();

// List weekly batch
router.get(
  "/pending",
  adminPayoutController.getPendingPayouts.bind(adminPayoutController)
);

// Approve or Flag specific payout
router.patch(
  "/:id/status",
  adminPayoutController.updatePayoutStatus.bind(adminPayoutController)
);

export default router;