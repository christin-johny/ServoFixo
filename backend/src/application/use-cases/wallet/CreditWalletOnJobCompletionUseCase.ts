import { ICreditWalletOnJobCompletionUseCase } from "../../interfaces/use-cases/wallet/IWalletUseCases";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { CreditWalletDto } from "../../dto/wallet/WalletDto";
import { Transaction } from "../../../domain/entities/Transaction";
import { IDatabaseSession } from "../../interfaces/services/IDatabaseSession";
import { WalletErrorMessages } from "../../constants/ErrorMessages";

export class CreditWalletOnJobCompletionUseCase implements ICreditWalletOnJobCompletionUseCase {
  constructor(private readonly _walletRepo: IWalletRepository) {}

  async execute(input: CreditWalletDto, session?: IDatabaseSession): Promise<void> {
    // 1. Find the technician's wallet
    const wallet = await this._walletRepo.findByTechnicianId(input.technicianId, session);
    
    if (!wallet) {
      throw new Error(WalletErrorMessages.WALLET_NOT_FOUND);
    }

    // 2. Use Domain Entity to calculate the 90% share (Encapsulated Business Rule)
    const technicianShare = wallet.calculateAndAddEarnings(input.totalAmount);

    // 3. Create a Ledger Entry (Transaction) for Audit Trail
    const transaction = new Transaction({
      walletId: wallet.id!,
      bookingId: input.bookingId,
      amount: technicianShare,
      type: "CREDIT",
      category: "JOB_EARNING",
      status: "COMPLETED",
      description: `Earning for Booking #${input.bookingId.slice(-6)} (90% share of ₹${input.totalAmount})`
    });

    // 4. Persist both Wallet update and Transaction entry
    // Since we are inside a session from VerifyPaymentUseCase, this is atomic
    await this._walletRepo.update(wallet, session);
    await this._walletRepo.createTransaction(transaction, session);
  }
}