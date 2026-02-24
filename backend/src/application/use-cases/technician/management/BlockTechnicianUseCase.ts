import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { IBlockTechnicianUseCase } from "../../../interfaces/use-cases/technician/ITechnicianManagementUseCases";
 
export class BlockTechnicianUseCase implements IBlockTechnicianUseCase
{
  constructor(
    private readonly _technicianRepo: ITechnicianRepository 
  ) {}

  async execute(
    id: string,
    isSuspended: boolean,
    reason?: string
  ): Promise<void> {
    await this._technicianRepo.toggleBlockTechnician(id, isSuspended, reason);
  }
}
