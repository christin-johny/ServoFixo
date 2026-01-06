import {
  ITechnicianRepository,
  TechnicianFilterParams,
} from "../../../../domain/repositories/ITechnicianRepository";
import { IUseCase } from "../../../interfaces/IUseCase";
import { TechnicianMapper } from "../../../mappers/TechnicianMapper";
import { ILogger } from "../../../interfaces/ILogger";
import { PaginatedTechnicianQueueResponse } from "../../../dto/technician/TechnicianQueueDto";

export class GetAllTechniciansUseCase
  implements
    IUseCase<
      PaginatedTechnicianQueueResponse,
      [TechnicianFilterParams & { page: number; limit: number }]
    >
{
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(
    params: TechnicianFilterParams & { page: number; limit: number }
  ): Promise<PaginatedTechnicianQueueResponse> {
    const result = await this._technicianRepo.findAllPaginated(
      params.page,
      params.limit,
      params
    );

    return {
      data: result.data.map((t) => TechnicianMapper.toQueueItem(t)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(result.total / result.limit),
    };
  }
}
