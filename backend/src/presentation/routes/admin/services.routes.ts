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
  adminServiceItemController.create
);

router.get("/", adminServiceItemController.getAll);

router.put(
  "/:id",
  upload.array("images", 5),
  validateRequest(createServiceItemSchema),
  adminServiceItemController.update
);

router.delete("/:id", adminServiceItemController.delete);

router.patch("/:id/toggle", (req, res) =>
  adminServiceItemController.toggleStatus(req, res)
);

export default router;
