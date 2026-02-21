import { IUseCase } from "../../../interfaces/IUseCase";
import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { ILogger } from "../../../interfaces/ILogger";
import { ErrorMessages } from "../../../constants/ErrorMessages";

export class BlockTechnicianUseCase
  implements IUseCase<void, [string, boolean, string | undefined]>
{
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(
    id: string,
    isSuspended: boolean,
    reason?: string
  ): Promise<void> {
    await this._technicianRepo.toggleBlockTechnician(id, isSuspended, reason);
  }
}
