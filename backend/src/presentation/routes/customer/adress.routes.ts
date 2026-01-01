import { Router } from 'express';
import { customerAddressController } from '../../../infrastructure/di/Container';

const router = Router();

router.get('/', customerAddressController.getMyAddresses.bind(customerAddressController));

router.post('/', customerAddressController.addAddress.bind(customerAddressController));

router.delete("/:id", customerAddressController.deleteAddress.bind(customerAddressController));

router.patch("/:id/default", customerAddressController.setDefaultAddress.bind(customerAddressController));

router.put("/:id", customerAddressController.updateAddress.bind(customerAddressController));

export default router;