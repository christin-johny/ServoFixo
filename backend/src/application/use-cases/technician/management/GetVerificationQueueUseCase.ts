import { ITechnicianRepository, VerificationQueueFilters } from "../../../../domain/repositories/ITechnicianRepository";
import { PaginatedTechnicianQueueResponse } from "../../../dto/technician/TechnicianQueueDto";
import { IGetVerificationQueueUseCase } from "../../../interfaces/use-cases/technician/ITechnicianManagementUseCases";
import { TechnicianMapper } from "../../../mappers/TechnicianMapper";

export class GetVerificationQueueUseCase implements IGetVerificationQueueUseCase {
  constructor(
    private readonly _technicianRepo: ITechnicianRepository
  ) {}

  async execute(params: VerificationQueueFilters): Promise<PaginatedTechnicianQueueResponse> {
    const result = await this._technicianRepo.findPendingVerification(params);
 
    const dtos = result.technicians.map(tech => TechnicianMapper.toQueueItem(tech));

    return {
      data: dtos,
      total: result.total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(result.total / params.limit)
    };
  }
}