import { Router } from "express";
import { customerCategoryController } from "../../../infrastructure/di/Container";

const router = Router();

router.get("/", customerCategoryController.getAll.bind(customerCategoryController));

export default router;