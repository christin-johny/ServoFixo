import { IUseCase } from "../../../interfaces/IUseCase";
import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { ILogger } from "../../../interfaces/ILogger";
import { ErrorMessages } from "../../../../../../shared/types/enums/ErrorMessages";
import { LogEvents } from "../../../../../../shared/constants/LogEvents";

export class DeleteTechnicianUseCase implements IUseCase<void, [string]> {
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(id: string): Promise<void> {
    const deleted = await this._technicianRepo.delete(id);
    
    if (!deleted) {
      throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND); 
    }
    
    this._logger.info(LogEvents.ADMIN_DELETE_TECH_SUCCESS, { id });
  }
}