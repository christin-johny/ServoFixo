import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { ErrorMessages } from "../../../constants/ErrorMessages";
import { IManageTechnicianUseCase } from "../../../interfaces/use-cases/technician/ITechnicianManagementUseCases";

export class ManageTechnicianUseCase  implements IManageTechnicianUseCase{
  constructor(
    private readonly _technicianRepo: ITechnicianRepository
  ) {}

  async toggleBlock(id: string, isSuspended: boolean, reason?: string): Promise<void> {
    const tech = await this._technicianRepo.findById(id);
    if (!tech) throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);

    const props = tech.toProps();
    props.isSuspended = isSuspended;
    props.suspendReason = reason || "";
    tech.setSuspension(isSuspended, reason); 
    
    await this._technicianRepo.update(tech);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this._technicianRepo.delete(id);
    if (!deleted) throw new Error("Failed to delete technician");
  }
}