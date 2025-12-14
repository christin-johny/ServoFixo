import { Router } from "express";
import { customerCategoryController } from "../../../infrastructure/di/Container";

const router = Router();

router.get("/", customerCategoryController.getAll);

export default router;
