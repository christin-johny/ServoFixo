import { IUseCase } from "../../../interfaces/IUseCase";
import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { ILogger } from "../../../interfaces/ILogger";
import { LogEvents } from "../../../../infrastructure/logging/LogEvents";
import { ErrorMessages } from "../../../constants/ErrorMessages";

export class DismissTechnicianRequestUseCase
  implements IUseCase<void, [string, string]>
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
