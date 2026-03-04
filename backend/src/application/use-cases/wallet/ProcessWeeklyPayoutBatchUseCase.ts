import { IProcessWeeklyPayoutBatchUseCase } from "../../interfaces/use-cases/wallet/IPayoutUseCases";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { IPayoutRepository } from "../../../domain/repositories/IPayoutRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { PayoutBatchResultDto } from "../../dto/wallet/PayoutDto";
import { Payout } from "../../../domain/entities/Payout";
import { Wallet } from "../../../domain/entities/Wallet";

export class ProcessWeeklyPayoutBatchUseCase implements IProcessWeeklyPayoutBatchUseCase {
  constructor(
    private readonly _walletRepo: IWalletRepository,
    private readonly _payoutRepo: IPayoutRepository,
    private readonly _techRepo: ITechnicianRepository
  ) {}

  async execute(): Promise<PayoutBatchResultDto> {
    const MIN_THRESHOLD = 500;
    const weekEnding = new Date(); 

    // 1. Fetch wallets where withdrawable balance >= 500
    const eligibleWallets = await this._walletRepo.findEligibleForPayout(MIN_THRESHOLD);
    
    // 2. Fetch currently pending payouts (The Safety Catch!)
    const currentPendingPayouts = await this._payoutRepo.findPending();
    const pendingTechnicianIds = currentPendingPayouts.map(p => p.toProps().technicianId);
    
    const payoutEntities: Payout[] = [];
    const walletsToUpdate: Wallet[] = []; 
    let totalBatchAmount = 0;

    for (const wallet of eligibleWallets) {
      const technicianId = wallet.toProps().technicianId;

      // SAFETY CATCH: If they already have a pending payout, SKIP THEM to prevent duplicates
      if (pendingTechnicianIds.includes(technicianId)) {
        continue; 
      }

      const tech = await this._techRepo.findById(technicianId);
      
      if (tech && tech.toProps().bankDetails && tech.toProps().payoutStatus !== "ON_HOLD") {
        const bank = tech.toProps().bankDetails!;
        const amountToPay = wallet.toProps().balances.withdrawable;

        const payout = new Payout({
          technicianId: tech.getId(),
          walletId: wallet.id!,
          amount: amountToPay,
          status: "PENDING",
          weekEnding: weekEnding,
          bankSnapshot: {
            accountNumber: bank.accountNumber,
            ifsc: bank.ifscCode,
            bankName: bank.bankName
          }
        });

        // USE THE NEW DDD METHOD TO FREEZE THE FUNDS
        wallet.freezeForPayout(amountToPay);

        payoutEntities.push(payout);
        walletsToUpdate.push(wallet);
        totalBatchAmount += amountToPay;
      }
    }

    if (payoutEntities.length > 0) {
      // Create the payout documents
      await this._payoutRepo.createBatch(payoutEntities);
      
      // Save the updated wallets to the DB so the withdrawable balance goes to 0
      for (const w of walletsToUpdate) {
        await this._walletRepo.update(w);
      }
    }

    return {
      processedCount: payoutEntities.length,
      totalAmount: totalBatchAmount
    };
  }
}