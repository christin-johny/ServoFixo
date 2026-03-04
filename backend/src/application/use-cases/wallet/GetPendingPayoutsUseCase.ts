import { IGetPendingPayoutsUseCase } from "../../interfaces/use-cases/wallet/IPayoutUseCases";
import { IPayoutRepository } from "../../../domain/repositories/IPayoutRepository";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository"; 

export class GetPendingPayoutsUseCase implements IGetPendingPayoutsUseCase {
  constructor(
    private readonly _payoutRepo: IPayoutRepository,
    private readonly _techRepo: ITechnicianRepository
  ) {}

  async execute(filters: { page: number; limit: number; search?: string; status?: string }): Promise< any> {
    let technicianIds: string[] | undefined;

    // 1. If searching by name, find the matching technicians first
    if (filters.search) {
      const techResult = await this._techRepo.findAllPaginated(1, 100, { search: filters.search });
      technicianIds = techResult.data.map(t => t.getId());

      // If no techs match the search, return empty immediately
      if (technicianIds.length === 0) {
        return { data: [], total: 0, page: filters.page, limit: filters.limit };
      }
    }

    // 2. Fetch the paginated and filtered payouts from DB
    const { data: payouts, total } = await this._payoutRepo.findFiltered({
      page: filters.page,
      limit: filters.limit,
      status: filters.status,
      technicianIds
    });

    const resultData = [];
    
    // 3. Map the real technician data
    for (const p of payouts) {
      const props = p.toProps();
      const tech = await this._techRepo.findById(props.technicianId);
      
      resultData.push({
        id: props.id!,
        technicianId: props.technicianId,
        technicianName: tech ? tech.toProps().name : "Unknown Technician",  
        technicianPhone: tech ? tech.toProps().phone : "N/A",
        amount: props.amount,
        status: props.status,
        weekEnding: props.weekEnding,
        bankDetails: props.bankSnapshot,
        processedAt: props.processedAt // Ensures the Paid Date shows up!
      });
    }

    // 4. Return the exact shape the frontend React component is expecting
    return {
      data: resultData,
      total,
      page: filters.page,
      limit: filters.limit
    };
  }
}