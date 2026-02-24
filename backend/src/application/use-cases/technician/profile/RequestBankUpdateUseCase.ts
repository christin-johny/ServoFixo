 
import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { BankUpdateRequest } from "../../../../domain/value-objects/TechnicianTypes";
import { RequestBankUpdateInput } from "../../../dto/technician/TechnicianProfileDto";
import { IRequestBankUpdateUseCase } from "../../../interfaces/use-cases/technician/ITechnicianProfileUseCases";

export class RequestBankUpdateUseCase implements IRequestBankUpdateUseCase {
  constructor(
    private readonly _technicianRepo: ITechnicianRepository 
  ) {}

  async execute(technicianId: string, input: RequestBankUpdateInput): Promise<void> {
 

    const technician = await this._technicianRepo.findById(technicianId);
    if (!technician) {
      throw new Error("Technician not found.");
    }

    // Domain Logic: Validate & State Change
    const request: BankUpdateRequest = {
      ...input,
      status: "PENDING",
      requestedAt: new Date(),
      id: "",
      isDismissed: false,
      isArchived: false
    };

    // This method sets payoutStatus = ON_HOLD
    technician.requestBankUpdate(request);

    // Persistence
    await this._technicianRepo.addBankUpdateRequest(technicianId, request);

  }
}