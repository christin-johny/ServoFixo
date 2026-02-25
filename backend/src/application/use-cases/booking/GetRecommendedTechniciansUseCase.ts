 import { ITechnicianRepository } from "../../../domain/repositories/ITechnicianRepository";
import { Technician } from "../../../domain/entities/Technician";
import { IGetRecommendedTechniciansUseCase } from "../../interfaces/use-cases/booking/IBookingUseCases";

export interface GetRecommendedTechniciansDto {
  zoneId: string;
  serviceId: string;
  search?: string;
}

export class GetRecommendedTechniciansUseCase implements IGetRecommendedTechniciansUseCase {
  constructor(private readonly _technicianRepo: ITechnicianRepository) {}

  async execute(input: GetRecommendedTechniciansDto): Promise<Technician[]> {
    return this._technicianRepo.findRecommendedForAdmin({
        zoneId: input.zoneId,
        serviceId: input.serviceId,
        search: input.search
    });
  }
}