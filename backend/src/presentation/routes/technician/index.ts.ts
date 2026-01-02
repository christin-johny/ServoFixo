import { Router } from "express";
import { JwtService } from "../../../infrastructure/security/JwtService";
// You will need to create this middleware similar to customerAuth.middleware.ts
import { makeTechnicianAuthMiddleware } from "../../middlewares/technicianAuth.middleware"; 

import authRoutes from "./auth.routes";

const router = Router();

const jwtService = new JwtService();
const technicianAuth = makeTechnicianAuthMiddleware(jwtService);

// Public Routes
router.use("/auth", authRoutes);

// Protected Routes (To be added as we build them)
// router.use("/profile", technicianAuth, profileRoutes);
// router.use("/jobs", technicianAuth, jobRoutes);

export default router;