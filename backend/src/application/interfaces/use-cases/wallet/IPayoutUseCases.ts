import { PayoutResponseDto, PayoutBatchResultDto } from "../../../dto/wallet/PayoutDto";

export interface IProcessWeeklyPayoutBatchUseCase { 
  execute(): Promise<PayoutBatchResultDto>;
}

export interface IGetPendingPayoutsUseCase {
  execute(filters: { page: number; limit: number; search?: string; status?: string }): Promise< PayoutResponseDto>; 
}

export interface IApprovePayoutUseCase {
  execute(payoutId: string, action: "APPROVE" | "FLAG", adminId: string,referenceId?: string): Promise<void>;
}