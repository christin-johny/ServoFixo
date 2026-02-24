import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
 
import { ErrorMessages } from "../../../constants/ErrorMessages"; 
import { IResubmitProfileUseCase } from "../../../interfaces/use-cases/technician/ITechnicianProfileUseCases";

export class ResubmitProfileUseCase implements IResubmitProfileUseCase{
  constructor(
    private readonly _technicianRepo: ITechnicianRepository 
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