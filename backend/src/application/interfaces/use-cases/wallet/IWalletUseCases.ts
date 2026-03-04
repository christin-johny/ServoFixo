import { CreditWalletDto, PaginatedTransactionResult, WalletResponseDto } from "../../../dto/wallet/WalletDto";
import { IDatabaseSession } from "../../services/IDatabaseSession";

export interface ICreditWalletOnJobCompletionUseCase {
  execute(input: CreditWalletDto, session?: IDatabaseSession): Promise<void>;
}

export interface IGetWalletBalanceUseCase {
  execute(technicianId: string): Promise<WalletResponseDto>;
}
export interface IInitializeWalletUseCase {
  execute(technicianId: string, session?: IDatabaseSession): Promise<void>;
}
export interface IGetWalletDetailsUseCase {
  execute(technicianId: string): Promise<WalletResponseDto>;
}

export interface IGetTransactionHistoryUseCase {
  execute(technicianId: string, page: number, limit: number): Promise<PaginatedTransactionResult>;
}