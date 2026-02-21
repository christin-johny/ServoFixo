import { ITechnicianRepository, VerificationQueueFilters } from "../../../../domain/repositories/ITechnicianRepository";
import { IUseCase } from "../../../interfaces/IUseCase";
import { PaginatedTechnicianQueueResponse } from "../../../dto/technician/TechnicianQueueDto";
import { TechnicianMapper } from "../../../mappers/TechnicianMapper";  
import { ILogger } from "../../../interfaces/ILogger";
import { LogEvents } from "../../../../infrastructure/logging/LogEvents";

export class GetVerificationQueueUseCase implements IUseCase<PaginatedTechnicianQueueResponse, [VerificationQueueFilters]> {
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _logger: ILogger
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