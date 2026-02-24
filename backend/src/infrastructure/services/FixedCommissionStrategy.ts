import { ICommissionStrategy } from "../../application/interfaces/services/ICommissionStrategy";

export class FixedCommissionStrategy implements ICommissionStrategy {
  private readonly RATE = 10; 

  calculateCommission(basePrice: number): number {
    return (basePrice * this.RATE) / 100;
  }

  getCommissionRate(): number {
    return this.RATE;
  }
}