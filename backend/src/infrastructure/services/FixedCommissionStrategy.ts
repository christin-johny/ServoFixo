import { ICommissionStrategy } from "../../application/interfaces/ICommissionStrategy";

export class FixedCommissionStrategy implements ICommissionStrategy {
  // ✅ HARDCODED: Changing this here updates the whole system
  private readonly RATE = 10; 

  calculateCommission(basePrice: number): number {
    return (basePrice * this.RATE) / 100;
  }

  getCommissionRate(): number {
    return this.RATE;
  }
}