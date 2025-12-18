import { Router } from 'express';
import {customerAddressController} from '../../../infrastructure/di/Container'

const router = Router();

router.get('/', customerAddressController.getMyAddresses);

router.post('/',customerAddressController.addAddress);

router.delete("/:id", customerAddressController.deleteAddress);

router.patch("/:id/default", customerAddressController.setDefaultAddress);

router.put("/:id",customerAddressController.updateAddress)

export default router;