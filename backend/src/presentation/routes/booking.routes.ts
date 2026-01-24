import { Router } from "express";
import { bookingController } from "../../infrastructure/di/Container";  
import { 
  makeCustomerAuthMiddleware 
} from "../middlewares/customerAuth.middleware";  
import { JwtService } from "../../infrastructure/security/JwtService";
import { makeTechnicianAuthMiddleware } from "../middlewares/technicianAuth.middleware";

const router = Router();
const jwtService = new JwtService();

// Middleware instances
const customerAuth = makeCustomerAuthMiddleware(jwtService);
const technicianAuth = makeTechnicianAuthMiddleware(jwtService);
  
router.post(
  "/", 
  customerAuth, 
  bookingController.createBooking.bind(bookingController)
);

router.post(
  "/:id/respond",
  technicianAuth,
  bookingController.respondToBooking.bind(bookingController)
);
router.patch(
  "/:id/status",
  technicianAuth, 
  bookingController.updateJobStatus.bind(bookingController)
);
router.post(
  "/:id/extras/:chargeId/respond",
  customerAuth, // Only customer can approve
  bookingController.respondToExtraCharge.bind(bookingController)
);
// --- FUTURE ROUTES (Placeholders for next steps) ---
/*

router.get(
  "/:id",
  commonAuth, // Allow customer/tech/admin
  bookingController.getBookingDetails.bind(bookingController)
);
*/

export default router;