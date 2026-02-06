import { Router } from "express";
import { 
  adminBookingController, 
  bookingController 
} from "../../../infrastructure/di/Container";

const router = Router();
 
router.get(
  "/", 
  adminBookingController.getAll.bind(adminBookingController)
);
// 1. Force Assign (Already existed)
router.post(
  "/:id/assign",
  adminBookingController.forceAssign.bind(adminBookingController)
);
 
router.post(
  "/:id/status",
  adminBookingController.forceStatus.bind(adminBookingController)
);
 
// 3. Get Details (Admin View)
router.get("/:id", bookingController.getBookingDetails.bind(bookingController)); 

router.post(
  "/:id/payment",
  adminBookingController.updatePayment.bind(adminBookingController)
);

export default router;