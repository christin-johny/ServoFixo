import { Router } from "express";
import { technicianNotificationController } from "../../../infrastructure/di/Container";

const router = Router();

router
  .get("/", technicianNotificationController.getNotifications)
  .patch("/:notificationId/read", technicianNotificationController.markAsRead)
  .post("/read-all", technicianNotificationController.markAllAsRead);

export default router;
