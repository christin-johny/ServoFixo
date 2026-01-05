import { ITechnicianRepository, PaginatedTechnicianResult, TechnicianFilterParams } from "../../../../domain/repositories/ITechnicianRepository";
import { IUseCase } from "../../../interfaces/IUseCase";
import { TechnicianMapper } from "../../../mappers/TechnicianMapper";
import { ILogger } from "../../../interfaces/ILogger";

export class GetAllTechniciansUseCase implements IUseCase<any, [TechnicianFilterParams & { page: number, limit: number }]> {
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(params: TechnicianFilterParams & { page: number, limit: number }): Promise<any> {
    const result = await this._technicianRepo.findAllPaginated(params.page, params.limit, params);
    
    // Map to simple list DTO
    return {
      data: result.data.map(t => TechnicianMapper.toQueueItem(t)), // Reusing QueueItem DTO as it has the fields we need
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit)
    };
  }
}