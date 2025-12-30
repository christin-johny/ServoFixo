import { Router } from "express";
import { adminCustomerController } from "../../../infrastructure/di/Container";

const router = Router();

router.get("/", (req, res) =>
  adminCustomerController.getAllCustomers(req, res)
);

router.get("/:id", (req, res) =>
  adminCustomerController.getCustomerById(req, res)
);

router.put("/:id", (req, res) =>
  adminCustomerController.updateCustomer(req, res)
);

router.delete("/:id", (req, res) =>
  adminCustomerController.deleteCustomer(req, res)
);
router.get("/:id/addresses", (req, res) =>
  adminCustomerController.getCustomerAddresses(req, res) 
);

export default router;
