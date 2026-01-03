import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { IUseCase } from "../../../interfaces/IUseCase";
import { Technician } from "../../../../domain/entities/Technician";
import { ILogger } from "../../../interfaces/ILogger";

export class GetTechnicianProfileUseCase implements IUseCase<Technician | null, [string]> {
  constructor(
    private readonly _technicianRepository: ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(technicianId: string): Promise<Technician | null> {
    // Just delegates to the repo to find by ID
    return await this._technicianRepository.findById(technicianId);
  }
}