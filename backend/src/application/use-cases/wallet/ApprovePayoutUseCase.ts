import { IApprovePayoutUseCase } from "../../interfaces/use-cases/wallet/IPayoutUseCases";
import { IPayoutRepository } from "../../../domain/repositories/IPayoutRepository";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { Transaction } from "../../../domain/entities/Transaction";
import { IUnitOfWork } from "../../interfaces/services/IUnitOfWork";

export class ApprovePayoutUseCase implements IApprovePayoutUseCase {
  constructor(
    private readonly _payoutRepo: IPayoutRepository,
    private readonly _walletRepo: IWalletRepository,
    private readonly _unitOfWork: IUnitOfWork
  ) {}

  async execute(payoutId: string, action: "APPROVE" | "FLAG", adminId: string): Promise<void> {
    const session = await this._unitOfWork.createSession();
    session.startTransaction();

    try {
      // 1. Fetch Payout record
      const payout = await this._payoutRepo.findById(payoutId);
      if (!payout) throw new Error("PAYOUT_NOT_FOUND");
      
      const payoutProps = payout.toProps();
      if (payoutProps.status !== "PENDING") {
        throw new Error(`Cannot ${action} a payout that is already ${payoutProps.status}`);
      }

      // 2. Fetch Wallet
      const wallet = await this._walletRepo.findById(payoutProps.walletId);
      if (!wallet) throw new Error("WALLET_NOT_FOUND");

      if (action === "APPROVE") {
        // 3. Update Wallet (Debit the withdrawable balance)
        wallet.finalizePayout(payoutProps.amount);

        // 4. Update Payout Status
        payout.approve(adminId);

        // 5. Create Ledger Entry for Audit Trail
        const debitTx = new Transaction({
          walletId: wallet.id!,
          amount: payoutProps.amount,
          type: "DEBIT",
          category: "WEEKLY_PAYOUT",
          status: "COMPLETED",
          description: `Weekly payout processed by Admin: ${adminId}`
        });

        await this._walletRepo.createTransaction(debitTx, session);
      } else {
        // Just flag the payout for review
        payout.markAsFlagged(adminId);
      }

      // 6. Persist changes atomically
      await this._payoutRepo.update(payout);
      await this._walletRepo.update(wallet, session);

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}