import { IUseCase } from "../../../interfaces/IUseCase";
import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { ILogger } from "../../../interfaces/ILogger";
import { ErrorMessages } from "../../../../../../shared/types/enums/ErrorMessages";

export class BlockTechnicianUseCase implements IUseCase<void, [string, boolean, string | undefined]> {
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(id: string, isSuspended: boolean, reason?: string): Promise<void> {
    // Reuse the repository method we added
    await this._technicianRepo.toggleBlockTechnician(id, isSuspended, reason);
    this._logger.info(`Technician ${id} suspension status changed to: ${isSuspended}`);
  }
}