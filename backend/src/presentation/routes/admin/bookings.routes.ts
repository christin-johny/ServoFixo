import { Router } from "express";
import { 
  adminBookingController, 
  bookingController 
} from "../../../infrastructure/di/Container";

const router = Router();
 
// 1. Force Assign (Already existed)
router.post(
  "/:id/assign",
  adminBookingController.forceAssign.bind(adminBookingController)
);

// 2. Force Status Update (NEW)
// Example payload: { "status": "COMPLETED", "reason": "Cash collected manually" }
router.post(
  "/:id/status",
  adminBookingController.forceStatus.bind(adminBookingController)
);
 
// 3. Get Details (Admin View)
router.get("/:id", (req, res, next) => { 
    (req as any).userId = (req as any).user?._id || (req as any).user?.id;  
    (req as any).role = "ADMIN"; 
    next();
}, bookingController.getBookingDetails.bind(bookingController)); 

router.post(
  "/:id/payment",
  adminBookingController.updatePayment.bind(adminBookingController)
);

export default router;