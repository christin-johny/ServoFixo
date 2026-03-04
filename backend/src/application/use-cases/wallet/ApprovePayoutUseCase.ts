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

  // THE FIX: Add referenceId parameter
  async execute(payoutId: string, action: "APPROVE" | "FLAG", adminId: string, referenceId?: string): Promise<void> {
    const session = await this._unitOfWork.createSession();
    session.startTransaction();

    try { 
      const payout = await this._payoutRepo.findById(payoutId);
      if (!payout) throw new Error("PAYOUT_NOT_FOUND");
      
      const payoutProps = payout.toProps();
      if (payoutProps.status !== "PENDING") {
        throw new Error(`Cannot ${action} a payout that is already ${payoutProps.status}`);
      }
 
      const wallet = await this._walletRepo.findById(payoutProps.walletId);
      if (!wallet) throw new Error("WALLET_NOT_FOUND");

      if (action === "APPROVE") { 
        wallet.finalizePayout(payoutProps.amount);
 
        payout.approve(adminId); 
        
        // THE FIX: Add the Reference ID to the transaction ledger so the Tech sees it
        const debitTx = new Transaction({
          walletId: wallet.id!,
          amount: payoutProps.amount,
          type: "DEBIT",
          category: "PAYOUT", // Note: Matches your Transaction schema enum
          status: "COMPLETED",
          description: `Bank Transfer Completed. UTR: ${referenceId || "N/A"}`
        });

        await this._walletRepo.createTransaction(debitTx, session);
      } else { 
        payout.markAsFlagged(adminId);
      }
 
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