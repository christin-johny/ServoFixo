
import Razorpay from "razorpay";
import crypto from "crypto";  
import { IPaymentGateway } from "../../domain/repositories/IPaymentGateway"; 

export class RazorpayService implements IPaymentGateway {
  private _razorpay: Razorpay;
  private keySecret: string;

  constructor() {
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    this._razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: this.keySecret
    });
  }

  async createOrder(amount: number, currency: string, receiptId: string): Promise<string> {
    try {
      const amountInSmallestUnit = Math.round(amount * 100);
      const options = {
        amount: amountInSmallestUnit,
        currency: currency,
        receipt: receiptId,
        payment_capture: 1 
      };
      const order = await this._razorpay.orders.create(options);
      return order.id;
    } catch (error: any) {
      throw new Error(`Razorpay Order Creation Failed: ${error.message}`);
    }
  }
 
  verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    const generatedSignature = crypto
      .createHmac("sha256", this.keySecret)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    return generatedSignature === signature;
  }
}