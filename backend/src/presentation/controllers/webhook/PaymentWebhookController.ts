import { Request, Response } from "express";
import crypto from "crypto";
import { IUseCase } from "../../../application/interfaces/IUseCase"; // <--- Interface
import { ILogger } from "../../../application/interfaces/ILogger";
import { ProcessPaymentDto } from "../../../application/dto/webhook/ProcessPaymentDto";

export class PaymentWebhookController {
  constructor( 
    private readonly _processPaymentUseCase: IUseCase<void, [ProcessPaymentDto]>,
    private readonly _logger: ILogger
  ) {}

  handleRazorpayWebhook = async (req: Request, res: Response) => {
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "my_secret";
      const signature = req.headers["x-razorpay-signature"] as string;
      const body = JSON.stringify(req.body);

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      if (expectedSignature !== signature) {
        return res.status(400).json({ status: "invalid_signature" });
      }
 
      const event = req.body.event;
      const payload = req.body.payload;

      if (event === "order.paid") {
        const dto: ProcessPaymentDto = {
            orderId: payload.payment.entity.order_id,
            transactionId: payload.payment.entity.id
        };
 
        await this._processPaymentUseCase.execute(dto);
      }

      return res.status(200).json({ status: "ok" });
    } catch (err: any) {
      this._logger.error(`Webhook Error: ${err.message}`);
      return res.status(500).json({ status: "error" });
    }
  };
}