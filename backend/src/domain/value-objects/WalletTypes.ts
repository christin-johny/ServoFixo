export type TransactionType = "CREDIT" | "DEBIT";

export type TransactionCategory = 
  | "JOB_EARNING" 
  | "PAYOUT" 
  | "REFUND_RECOUP" 
  | "BONUS" 
  | "PENALTY"
  | "WEEKLY_PAYOUT";

export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface WalletBalances {
  pending: number;        
  withdrawable: number;   
  locked: number;          
  totalEarned: number;    
}

export interface WalletMetadata {
  lastPayoutAt?: Date;
  bankDetailsSnapshot?: string; 
}