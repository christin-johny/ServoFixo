import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { ILogger } from "../../../interfaces/ILogger";
import { ErrorMessages } from "../../../../../../shared/types/enums/ErrorMessages";

export class ManageTechnicianUseCase {
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async toggleBlock(id: string, isSuspended: boolean, reason?: string): Promise<void> {
    const tech = await this._technicianRepo.findById(id);
    if (!tech) throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);

    const props = tech.toProps();
    props.isSuspended = isSuspended;
    props.suspendReason = reason || "";
    tech.setSuspension(isSuspended, reason); 
    
    await this._technicianRepo.update(tech);
    this._logger.info(`Technician ${id} suspension status: ${isSuspended}`);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this._technicianRepo.delete(id);
    if (!deleted) throw new Error("Failed to delete technician");
    this._logger.info(`Technician ${id} deleted`);
  }
}