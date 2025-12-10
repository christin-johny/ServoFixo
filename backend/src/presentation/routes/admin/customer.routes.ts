// backend/src/presentation/routes/customer.routes.ts (Update)

import { Router } from 'express';
// ✅ Ensure all required components are imported
import { adminCustomerController } from '../../../infrastructure/di/Container'; 

const router = Router();

// 1. Get All Customers (READ) - GET /
router.get(
    '/', 
    (req, res) => adminCustomerController.getAllCustomers(req, res)
);

// ✅ 2. Update Customer Profile (UPDATE) - PUT /:id
router.put(
    '/:id',
    (req, res) => adminCustomerController.updateCustomer(req, res)
);

// 3. Reset Password Trigger (SECURITY) - POST /:id/reset-password (Future)
// ...

export default router;