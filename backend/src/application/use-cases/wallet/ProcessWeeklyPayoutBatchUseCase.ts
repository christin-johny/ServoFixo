import { IProcessWeeklyPayoutBatchUseCase } from "../../interfaces/use-cases/wallet/IPayoutUseCases";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { IPayoutRepository } from "../../../domain/repositories/IPayoutRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { PayoutBatchResultDto } from "../../dto/wallet/PayoutDto";
import { Payout } from "../../../domain/entities/Payout";

export class ProcessWeeklyPayoutBatchUseCase implements IProcessWeeklyPayoutBatchUseCase {
  constructor(
    private readonly _walletRepo: IWalletRepository,
    private readonly _payoutRepo: IPayoutRepository,
    private readonly _techRepo: ITechnicianRepository
  ) {}

  async execute(): Promise<PayoutBatchResultDto> {
    const MIN_THRESHOLD = 500;
    // Payout runs for work done up until now
    const weekEnding = new Date(); 

    // 1. Fetch wallets where withdrawable balance >= 500
    const eligibleWallets = await this._walletRepo.findEligibleForPayout(MIN_THRESHOLD);
    
    const payoutEntities: Payout[] = [];
    let totalBatchAmount = 0;

    for (const wallet of eligibleWallets) {
      const tech = await this._techRepo.findById(wallet.toProps().technicianId);
      
      // Only batch if technician has valid bank details
      if (tech && tech.toProps().bankDetails) {
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

        payoutEntities.push(payout);
        totalBatchAmount += amountToPay;
      }
    }

    if (payoutEntities.length > 0) {
      await this._payoutRepo.createBatch(payoutEntities);
    }

    return {
      processedCount: payoutEntities.length,
      totalAmount: totalBatchAmount
    };
  }
}