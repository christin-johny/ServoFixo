import { PayoutResponseDto, PayoutBatchResultDto } from "../../../dto/wallet/PayoutDto";

export interface IProcessWeeklyPayoutBatchUseCase {
  /**
   * Scans all wallets, identifies those > ₹500, and creates Payout records.
   * Scheduled to run every Sunday night.
   */
  execute(): Promise<PayoutBatchResultDto>;
}

export interface IGetPendingPayoutsUseCase {
  /**
   * For Admin Panel: Returns all payouts awaiting approval.
   */
  execute(): Promise<PayoutResponseDto[]>;
}

export interface IApprovePayoutUseCase {

  execute(payoutId: string, action: "APPROVE" | "FLAG", adminId: string): Promise<void>;
}