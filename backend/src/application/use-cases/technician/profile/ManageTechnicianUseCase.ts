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

    // Update entity state (we manually update props since specific setter might not exist yet)
    // In a pure domain model, you would add tech.setSuspension(status, reason)
    const props = tech.toProps();
    props.isSuspended = isSuspended;
    props.suspendReason = reason || "";
    
    // We need to re-instantiate or update the entity. 
    // Since your repository uses `update(tech)`, we need to modify the tech object.
    // A cleaner way in your current setup might be passing the modified props back:
    /* Note: The best practice is adding a method to Technician.ts:
       public setSuspension(status: boolean, reason?: string) { ... }
       I will assume we do that or modify the underlying private fields if accessible, 
       but for now let's use the repository update flow.
    */
   
    // Hack for now if setter is missing: logic inside Repository 'update' handles persistence
    // But we need to update the object in memory to pass it.
    // Let's rely on a direct repository patch if your Repo supports it, otherwise:
    
    // Ideally, update Technician.ts with this method:
    // tech.setSuspension(isSuspended, reason);
    
    // For now, let's assume we implement logic in Controller or here via Repo custom update if needed.
    // Actually, let's just use the `update` method by modifying the internal state if we can, 
    // or extend the repository to `updateStatus`.
    
    // Let's stick to the Clean Arch pattern:
    // 1. Get Entity
    // 2. Modify Entity
    // 3. Save Entity
    
    // Assuming you add this to Technician.ts (I will provide the snippet below)
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