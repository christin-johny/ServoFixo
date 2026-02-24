import { NextFunction, Request, Response } from "express";
import crypto from "crypto";
import { IUseCase } from "../../../application/interfaces/services/IUseCase";
import { ILogger } from "../../../application/interfaces/services/ILogger";
import { ProcessPaymentDto } from "../../../application/dto/webhook/ProcessPaymentDto";
import { StatusCodes } from "../../utils/StatusCodes";

export class PaymentWebhookController {
  constructor( 
    private readonly _processPaymentUseCase: IUseCase<void, [ProcessPaymentDto]>,
    private readonly _logger: ILogger
  ) {}

  handleRazorpayWebhook = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "my_secret";
      const signature = req.headers["x-razorpay-signature"] as string;
      const body = JSON.stringify(req.body);

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      if (expectedSignature !== signature) {
        // Webhooks often require a specific response even on failure to stop retries, 
        // but 400 is standard for invalid signatures.
        return res.status(StatusCodes.BAD_REQUEST).json({ status: "invalid_signature" });
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

      return res.status(StatusCodes.OK).json({ status: "ok" });
    } catch (err: unknown) {
      (err as Error & { logContext?: string }).logContext = "RAZORPAY_WEBHOOK_FAILED";
      next(err);
    }
  };
}