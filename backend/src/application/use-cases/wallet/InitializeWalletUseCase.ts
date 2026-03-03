import { IInitializeWalletUseCase } from "../../interfaces/use-cases/wallet/IWalletUseCases";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { Wallet } from "../../../domain/entities/Wallet";
import { IDatabaseSession } from "../../interfaces/services/IDatabaseSession";
export class InitializeWalletUseCase implements IInitializeWalletUseCase {
  constructor(private readonly _walletRepo: IWalletRepository) {}

  async execute(technicianId: string, session?: IDatabaseSession): Promise<void> { 
    const existingWallet = await this._walletRepo.findByTechnicianId(technicianId, session);
    
    if (existingWallet) { 
      return; 
    }
 
    const newWallet = new Wallet({
      technicianId: technicianId,
      balances: {
        pending: 0,
        withdrawable: 0,
        locked: 0,
        totalEarned: 0
      },
      metadata: {
        lastPayoutAt: undefined
      }
    });
 
    await this._walletRepo.create(newWallet);
  }
}
