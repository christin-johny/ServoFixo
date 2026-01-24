import { Router } from "express";
import { JwtService } from "../../../infrastructure/security/JwtService"; 
import { makeTechnicianAuthMiddleware } from "../../middlewares/technicianAuth.middleware"; 

import authRoutes from "./auth.routes";
import profileRoutes from'./profile.routes';
import dataRoutes from'./data.routes';
import notificationRoutes from "./notification.routes";
const router = Router();

const jwtService = new JwtService();
const technicianAuth = makeTechnicianAuthMiddleware(jwtService);

// Public Routes
router.use("/auth", authRoutes);

router.use("/profile", technicianAuth, profileRoutes);

router.use("/data", technicianAuth, dataRoutes);

router.use("/notifications",technicianAuth, notificationRoutes);


export default router;