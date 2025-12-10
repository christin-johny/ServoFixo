// backend/src/presentation/routes/customer.routes.ts (Update)

import { Router } from "express";
import { adminCustomerController } from "../../../infrastructure/di/Container";

const router = Router();

// 1. Get All Customers (READ) - GET /
router.get("/", (req, res) =>
  adminCustomerController.getAllCustomers(req, res)
);

// ✅ 2. Get Customer By ID (READ) - GET /:id
router.get("/:id", (req, res) =>
  adminCustomerController.getCustomerById(req, res)
);

// 3. Update Customer (UPDATE) - PUT /:id
router.put("/:id", (req, res) =>
  adminCustomerController.updateCustomer(req, res)
);

router.delete(
    '/:id',
    (req, res) => adminCustomerController.deleteCustomer(req, res)
);

export default router;
