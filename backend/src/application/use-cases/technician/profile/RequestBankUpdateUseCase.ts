import { IUseCase } from "../../../interfaces/IUseCase";
import { ILogger } from "../../../interfaces/ILogger"; 
import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { BankUpdateRequest } from "../../../../domain/value-objects/TechnicianTypes";

export interface RequestBankUpdateInput {
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  upiId?: string;
  proofUrl: string;
}

export class RequestBankUpdateUseCase implements IUseCase<void, [string, RequestBankUpdateInput]> {
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _logger: ILogger
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