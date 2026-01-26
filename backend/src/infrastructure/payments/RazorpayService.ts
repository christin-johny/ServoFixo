import Razorpay from "razorpay";
import { IPaymentGateway } from "../../domain/repositories/IPaymentGateway"; 

export class RazorpayService implements IPaymentGateway {
  private _razorpay: Razorpay;

  constructor() {
    // Initialize with keys from your .env / config
    this._razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || ""
    });
  }

  async createOrder(amount: number, currency: string, receiptId: string): Promise<string> {
    try {
      // Razorpay expects amount in the smallest currency unit (e.g., Paise for INR)
      // 100 INR = 10000 Paise
      const amountInSmallestUnit = Math.round(amount * 100);

      const options = {
        amount: amountInSmallestUnit,
        currency: currency,
        receipt: receiptId,
        payment_capture: 1 // 1 = Automatic Capture, 0 = Manual
      };

      const order = await this._razorpay.orders.create(options);
      
      return order.id; // Returns "order_9A33XF..."

    } catch (error: any) {
      throw new Error(`Razorpay Order Creation Failed: ${error.message}`);
    }
  }
}