import { IUseCase } from "../../../interfaces/IUseCase";
import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { ILogger } from "../../../interfaces/ILogger";

export class DeleteTechnicianUseCase implements IUseCase<void, [string]> {
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(id: string): Promise<void> {
    const deleted = await this._technicianRepo.delete(id);
    if (!deleted) throw new Error("Failed to delete technician");
    this._logger.info(`Technician ${id} deleted`);
  }
}