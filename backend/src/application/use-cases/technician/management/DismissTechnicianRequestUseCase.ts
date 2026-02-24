
import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { ILogger } from "../../../interfaces/services/ILogger";
import { LogEvents } from "../../../../infrastructure/logging/LogEvents";
import { IDismissTechnicianRequestUseCase } from "../../../interfaces/use-cases/technician/ITechnicianManagementUseCases";

export class DismissTechnicianRequestUseCase
  implements IDismissTechnicianRequestUseCase
{
  constructor(
    private readonly _technicianRepository: ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(technicianId: string, requestId: string): Promise<void> { 
    try { 
      await this._technicianRepository.dismissRequest(technicianId, requestId);

    } catch (error) {
      this._logger.error(
        LogEvents.TECH_DISMISS_REQUEST_FAILED,
        `Error: ${error} | RequestID: ${requestId}`
      );
      throw error;
    }
  }
}
