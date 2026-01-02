import { Router } from "express";
import { technicianAuthController } from "../../../infrastructure/di/Container";

const router = Router();

// Registration
router.post("/register/init-otp", technicianAuthController.register.bind(technicianAuthController));
router.post("/register/verify-otp", technicianAuthController.verifyRegistration.bind(technicianAuthController));

// Login
router.post("/login", technicianAuthController.login.bind(technicianAuthController));

// ✅ Forgot Password Routes
router.post("/forgot-password/init-otp", technicianAuthController.forgotPasswordInitOtp.bind(technicianAuthController));
router.post("/forgot-password/verify-otp", technicianAuthController.forgotPasswordVerifyOtp.bind(technicianAuthController));

// Logout
router.post("/logout", technicianAuthController.logout.bind(technicianAuthController));

export default router;