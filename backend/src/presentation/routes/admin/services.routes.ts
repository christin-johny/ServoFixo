import { Router } from "express";
import { adminServiceItemController } from "../../../infrastructure/di/Container";
import { upload } from "../../../infrastructure/middleware/uploadMiddleware";
import { validateRequest } from "../../../infrastructure/middleware/validateRequest";
import { createServiceItemSchema } from "../../validation/serviceSchemas";

const router = Router();

router.post(
  "/",
  upload.array("images", 5),
  validateRequest(createServiceItemSchema),
  adminServiceItemController.create.bind(adminServiceItemController)
);

router.get("/", adminServiceItemController.getAll.bind(adminServiceItemController));

router.put(
  "/:id",
  upload.array("images", 5),
  validateRequest(createServiceItemSchema),
  adminServiceItemController.update.bind(adminServiceItemController)
);

router.delete("/:id", adminServiceItemController.delete.bind(adminServiceItemController));

router.patch("/:id/toggle", adminServiceItemController.toggleStatus.bind(adminServiceItemController));

export default router;