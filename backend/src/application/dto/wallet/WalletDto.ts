export interface CreditWalletDto {
  bookingId: string;
  technicianId: string;
  totalAmount: number; // Total customer paid
}

export interface WalletResponseDto {
  id: string;
  technicianId: string;
  balances: {
    pending: number;
    withdrawable: number;
    locked: number;
    totalEarned: number;
  };
  lastPayoutAt?: Date;
}

export interface TransactionResponseDto {
  id: string;
  walletId: string;
  bookingId?: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  category: string;
  status: string;
  description?: string;
  createdAt: Date;
}

export interface PaginatedTransactionResult {
  data: TransactionResponseDto[];
  total: number;
  page: number;
  limit: number;
}