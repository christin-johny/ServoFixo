import { IGetPendingPayoutsUseCase } from "../../interfaces/use-cases/wallet/IPayoutUseCases";
import { IPayoutRepository } from "../../../domain/repositories/IPayoutRepository";
import { PayoutResponseDto } from "../../dto/wallet/PayoutDto";

export class GetPendingPayoutsUseCase implements IGetPendingPayoutsUseCase {
  constructor(private readonly _payoutRepo: IPayoutRepository) {}

  async execute(): Promise<PayoutResponseDto[]> {
    const payouts = await this._payoutRepo.findPending();
    
    return payouts.map(p => {
      const props = p.toProps();
      return {
        id: props.id!,
        technicianId: props.technicianId,
        technicianName: "Technician",  
        amount: props.amount,
        status: props.status,
        weekEnding: props.weekEnding,
        bankDetails: props.bankSnapshot
      };
    });
  }
}