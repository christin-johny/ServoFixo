import { Router } from "express";
import { authTokenController } from "../../../infrastructure/di/Container";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";

const router = Router();

router.post("/refresh", authTokenController.refresh);

router.post("/login", (req, res) => {
  res.status(501).json({
    error: "Technician login not yet implemented",
  });
});

router.post("/register", (req, res) => {
  res.status(StatusCodes.NOT_IMPLEMENTED).json({
    error: "Technician registration not yet implemented",
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(200).json({
    message: "Logged out successfully",
  });
});

export default router;