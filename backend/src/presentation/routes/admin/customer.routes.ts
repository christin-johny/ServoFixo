import { Router } from "express";
import { adminCustomerController } from "../../../infrastructure/di/Container";

const router = Router();

router.get("/", adminCustomerController.getAllCustomers.bind(adminCustomerController));

router.get("/:id", adminCustomerController.getCustomerById.bind(adminCustomerController));

router.put("/:id", adminCustomerController.updateCustomer.bind(adminCustomerController));

router.delete("/:id", adminCustomerController.deleteCustomer.bind(adminCustomerController));

router.get("/:id/addresses", adminCustomerController.getCustomerAddresses.bind(adminCustomerController));

export default router;