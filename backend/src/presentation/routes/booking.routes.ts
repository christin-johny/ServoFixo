import { Router } from "express";
import { bookingController } from "../../infrastructure/di/Container";  
import { 
  makeCustomerAuthMiddleware 
} from "../middlewares/customerAuth.middleware";  
import { JwtService } from "../../infrastructure/security/JwtService";
import { makeTechnicianAuthMiddleware } from "../middlewares/technicianAuth.middleware";
import { upload } from "../../infrastructure/middleware/uploadMiddleware";
const router = Router();
const jwtService = new JwtService();

// Middleware instances
const customerAuth = makeCustomerAuthMiddleware(jwtService);
const technicianAuth = makeTechnicianAuthMiddleware(jwtService);
  
// --- 1. Creation & Handshake ---

router.post(
  "/", 
  customerAuth, 
  bookingController.createBooking.bind(bookingController)
);
router.get(
  "/", 
  customerAuth, 
  bookingController.getCustomerBookings.bind(bookingController)
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
  "/:id/extras",  
  technicianAuth,
  upload.single('proof'),  
  bookingController.addExtraCharge.bind(bookingController)
);
router.post(
  "/:id/extras/:chargeId/respond",
  customerAuth,  
  bookingController.respondToExtraCharge.bind(bookingController)
);

router.post(
  "/:id/complete",
  technicianAuth,
  upload.single('proof'),  
  bookingController.completeJob.bind(bookingController)
);
 

router.get(
  "/customer/:id", 
  customerAuth,
  (req, res, next) => {
    
    (req as any).role = "CUSTOMER";  
    next();
  },
  bookingController.getBookingDetails.bind(bookingController)
);
router.get(
  "/technician/history",
  technicianAuth,
  bookingController.getTechnicianHistory.bind(bookingController)
);
 
router.get(
  "/technician/:id", 
  technicianAuth, 
  (req, res, next) => {
    (req as any).role = "technician";  
    next();
  },
  bookingController.getBookingDetails.bind(bookingController)
);
router.post(
  "/:id/cancel/customer", 
  customerAuth, 
  (req, res, next) => { (req as any).role = "customer"; next(); },
  bookingController.cancelBooking.bind(bookingController)
);
router.post(
  "/:id/start",
  technicianAuth,
  bookingController.startJob.bind(bookingController)
);

router.post(
  "/:id/payment/verify",
  customerAuth,
  bookingController.verifyPayment.bind(bookingController)
);

// Technician Cancel
router.post(
  "/:id/cancel/technician", 
  technicianAuth, 
  (req, res, next) => { (req as any).role = "technician"; next(); },
  bookingController.cancelBooking.bind(bookingController)
);
router.post(
  "/:id/rate",
  customerAuth,  
  bookingController.rateTechnician.bind(bookingController)
);

export default router;