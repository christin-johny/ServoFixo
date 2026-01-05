export interface ICommissionStrategy {
  calculateCommission(basePrice: number): number;
  getCommissionRate(): number;
}