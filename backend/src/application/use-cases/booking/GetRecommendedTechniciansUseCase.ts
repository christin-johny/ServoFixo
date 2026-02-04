import { IUseCase } from "../../interfaces/IUseCase";
import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { Technician } from "../../../domain/entities/Technician";

export interface GetRecommendedTechniciansDto {
  zoneId: string;
  serviceId: string;
  search?: string;
}

export class GetRecommendedTechniciansUseCase implements IUseCase<Technician[], [GetRecommendedTechniciansDto]> {
  constructor(private readonly _technicianRepo: ITechnicianRepository) {}

  async execute(input: GetRecommendedTechniciansDto): Promise<Technician[]> {
    return this._technicianRepo.findRecommendedForAdmin({
        zoneId: input.zoneId,
        serviceId: input.serviceId,
        search: input.search
    });
  }
}