import { IGetTransactionHistoryUseCase } from "../../interfaces/use-cases/wallet/IWalletUseCases";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { PaginatedTransactionResult } from "../../dto/wallet/WalletDto";
import { WalletMapper } from "../../mappers/WalletMapper";
import { WalletErrorMessages } from "../../constants/ErrorMessages";

export class GetTransactionHistoryUseCase implements IGetTransactionHistoryUseCase {
  constructor(private readonly _walletRepo: IWalletRepository) {}

  async execute(technicianId: string, page: number, limit: number): Promise<PaginatedTransactionResult> {

    const wallet = await this._walletRepo.findByTechnicianId(technicianId);
    if (!wallet) throw new Error(WalletErrorMessages.WALLET_NOT_FOUND);

    const skip = (page - 1) * limit;

    const { data, total } = await this._walletRepo.findTransactionsByWalletId(wallet.id!, limit, skip);

    return {
      data: data.map(t => WalletMapper.toTransactionResponse(t)),
      total,
      page,
      limit
    };
  }
}