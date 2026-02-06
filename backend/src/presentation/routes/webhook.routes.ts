import { Router } from "express";
import { paymentWebhookController } from "../../infrastructure/di/Container";

const router = Router();
 
router.post(
  "/razorpay",
  paymentWebhookController.handleRazorpayWebhook.bind(paymentWebhookController)
);

export default router;