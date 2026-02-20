import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { IUseCase } from "../../../interfaces/IUseCase";
import { ILogger } from "../../../interfaces/ILogger";
import { ErrorMessages } from "../../../../../../shared/types/enums/ErrorMessages";
import { LogEvents } from "../../../../../../shared/constants/LogEvents";

export class ResubmitProfileUseCase implements IUseCase<void, [string]> {
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(technicianId: string): Promise<void> {
    const tech = await this._technicianRepo.findById(technicianId);
    
    if (!tech) {
      throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);
    }
 
    if (tech.getVerificationStatus() !== "REJECTED") {
      throw new Error("Only rejected profiles can be resubmitted.");
    }
 
    tech.updateVerificationStatus("VERIFICATION_PENDING", ""); 
 
    await this._technicianRepo.update(tech);

  }
}