import { Router } from "express";
import { JwtService } from "../../../infrastructure/security/JwtService"; 
import { makeTechnicianAuthMiddleware } from "../../middlewares/technicianAuth.middleware"; 

import authRoutes from "./auth.routes";
import profileRoutes from'./profile.routes';
import dataRoutes from'./data.routes';
import notificationRoutes from "./notification.routes";
import techDashboardRoutes from "./dashboard.routes";
const router = Router();

const jwtService = new JwtService();
const technicianAuth = makeTechnicianAuthMiddleware(jwtService);

router.use("/auth", authRoutes);

router.use("/dashboard", technicianAuth, techDashboardRoutes);

router.use("/profile", technicianAuth, profileRoutes);

router.use("/data", technicianAuth, dataRoutes);

router.use("/notifications",technicianAuth, notificationRoutes);


export default router;