import { Router } from "express";
import { JwtService } from "../../../infrastructure/security/JwtService";
import { makeAdminAuthMiddleware } from "../../middlewares/adminAuth.middleware";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";

// Import sub-routers
import adminAuthRoutes from "./auth.routes";
import adminZonesRoutes from "./zones.routes";
import adminCategoryRoutes from "./categories.routes";
import serviceItemRoutes from './services.routes';

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

router.use("/zones", adminZonesRoutes);
router.use("/categories", adminCategoryRoutes);
router.use('/services', adminAuth, serviceItemRoutes);
export default router;
