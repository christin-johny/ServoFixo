export interface IPaymentGateway {
  createOrder(amount: number, currency: string, receiptId: string): Promise<string>;
}