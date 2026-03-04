import { Payout } from "../entities/Payout";

export interface IPayoutRepository {
  createBatch(payouts: Payout[]): Promise<void>;
  findById(id: string): Promise<Payout | null>;
  update(payout: Payout): Promise<void>;
  findPending(): Promise<Payout[]>;
  findAllGroupedByWeek(): Promise<Payout[] | null>; 
  findFiltered(filters: { page: number; limit: number; status?: string; technicianIds?: string[] }): Promise<{ data: Payout[]; total: number }>;
}