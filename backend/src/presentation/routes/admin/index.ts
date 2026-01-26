import { Router } from "express";
import { JwtService } from "../../../infrastructure/security/JwtService";
import { makeAdminAuthMiddleware } from "../../middlewares/adminAuth.middleware";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
 
import adminAuthRoutes from "./auth.routes";
import adminZonesRoutes from "./zones.routes";
import adminCategoryRoutes from "./categories.routes";
import serviceItemRoutes from './services.routes';
import adminCustomerRoutes from './customer.routes'
import adminTechnicianRoutes from "./technician.routes";
import adminBookingRoutes from "./bookings.routes";
const router = Router();

const jwtService = new JwtService();
const adminAuth = makeAdminAuthMiddleware(jwtService);

router.use("/auth", adminAuthRoutes);

router.get("/dashboard", adminAuth, (req, res) => {
  const user = (req as any).user;
  return res.status(StatusCodes.OK).json({
    message: "Admin dashboard data",
    user,
  });
});

router.use("/zones",adminAuth, adminZonesRoutes);
router.use("/categories",adminAuth, adminCategoryRoutes);
router.use('/services', adminAuth, serviceItemRoutes);
router.use('/customers', adminAuth, adminCustomerRoutes);
router.use("/technicians", adminAuth, adminTechnicianRoutes); 
router.use("/bookings", adminAuth, adminBookingRoutes);
export default router;
