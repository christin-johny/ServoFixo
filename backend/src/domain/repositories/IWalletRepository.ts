import { Wallet } from "../entities/Wallet";
import { Transaction } from "../entities/Transaction";
import { IBaseRepository } from "./IBaseRepository";
import { IDatabaseSession } from "../../application/interfaces/services/IDatabaseSession";

export interface IWalletRepository extends IBaseRepository<Wallet> {
  findByTechnicianId(technicianId: string, session?: IDatabaseSession): Promise<Wallet | null>;
  update(wallet: Wallet, session?: IDatabaseSession): Promise<Wallet>;
  createTransaction(transaction: Transaction, session?: IDatabaseSession): Promise<Transaction>;
  
  findTransactionsByWalletId(
    walletId: string, 
    limit: number, 
    skip: number
  ): Promise<{ data: Transaction[]; total: number }>;

  findEligibleForPayout(minAmount: number): Promise<Wallet[]>;
}