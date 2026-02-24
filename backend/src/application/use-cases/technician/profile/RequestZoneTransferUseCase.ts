 import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { ZoneRequest } from "../../../../domain/value-objects/TechnicianTypes";
import { ErrorMessages } from "../../../constants/ErrorMessages";
import { RequestZoneTransferInput } from "../../../dto/technician/TechnicianProfileDto";
import { IRequestZoneTransferUseCase } from "../../../interfaces/use-cases/technician/ITechnicianProfileUseCases";



export class RequestZoneTransferUseCase implements IRequestZoneTransferUseCase {
  constructor(
    private readonly _technicianRepo: ITechnicianRepository 
  ) {}

  async execute(technicianId: string, input: RequestZoneTransferInput): Promise<void> {
 
    const technician = await this._technicianRepo.findById(technicianId);
    if (!technician) {
      throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);
    }


    // 1. Check for existing pending requests
    const existingRequest = technician.getZoneRequests().find(r => r.status === "PENDING");
    if (existingRequest) {
      throw new Error(ErrorMessages.PENDING_ZONE_REQUEST);
    }

    // 2. Construct Request
    const request: ZoneRequest = {
      currentZoneId: input.currentZoneId,
      requestedZoneId: input.requestedZoneId,
      status: "PENDING",
      requestedAt: new Date(),
      id: "",
      isDismissed: false,
      isArchived: false
    };

    // 3. Persist
    await this._technicianRepo.addZoneRequest(technicianId, request);

  }
}