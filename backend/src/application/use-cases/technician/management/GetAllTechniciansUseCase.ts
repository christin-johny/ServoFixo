import {
  ITechnicianRepository,
  TechnicianFilterParams,
} from "../../../../domain/repositories/ITechnicianRepository";
import { TechnicianMapper } from "../../../mappers/TechnicianMapper";
import { PaginatedTechnicianQueueResponse } from "../../../dto/technician/TechnicianQueueDto";
import { IGetAllTechniciansUseCase } from "../../../interfaces/use-cases/technician/ITechnicianManagementUseCases";

export class GetAllTechniciansUseCase
  implements
    IGetAllTechniciansUseCase
{
  constructor(
    private readonly _technicianRepo: ITechnicianRepository
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
