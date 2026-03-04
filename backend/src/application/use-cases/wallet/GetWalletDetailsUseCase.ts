import { IGetWalletDetailsUseCase } from "../../interfaces/use-cases/wallet/IWalletUseCases";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { WalletResponseDto } from "../../dto/wallet/WalletDto";
import { WalletMapper } from "../../mappers/WalletMapper";
import { WalletErrorMessages } from "../../constants/ErrorMessages";

export class GetWalletDetailsUseCase implements IGetWalletDetailsUseCase {
  constructor(private readonly _walletRepo: IWalletRepository) {}

  async execute(technicianId: string): Promise<WalletResponseDto> {
    const wallet = await this._walletRepo.findByTechnicianId(technicianId);
    
    if (!wallet) {
      throw new Error(WalletErrorMessages.WALLET_NOT_FOUND);
    }

    return WalletMapper.toResponse(wallet);
  }
}