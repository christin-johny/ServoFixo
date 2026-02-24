import { ILogger } from "../../../interfaces/services/ILogger";
import { LogEvents } from "../../../../infrastructure/logging/LogEvents";
import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { ServiceRequest } from "../../../../domain/value-objects/TechnicianTypes";
import { ErrorMessages } from "../../../constants/ErrorMessages";
import { RequestServiceAddInput } from "../../../dto/technician/TechnicianProfileDto";
import { IRequestServiceAddUseCase } from "../../../interfaces/use-cases/technician/ITechnicianProfileUseCases";



export class RequestServiceAddUseCase implements IRequestServiceAddUseCase{
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(technicianId: string, input: RequestServiceAddInput): Promise<void> {

    const technician = await this._technicianRepo.findById(technicianId);
    if (!technician) {
      this._logger.error(`${LogEvents.TECH_NOT_FOUND}: Technician ${technicianId}`);
      throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);
    }
 
    const request: ServiceRequest = { 
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      serviceId: input.serviceId,
      categoryId: input.categoryId,
      action: input.action, 
      proofUrl: input.proofUrl,
      status: "PENDING",
      requestedAt: new Date(),
      isDismissed: input.isDismissed ?? false, 
      isArchived: input.isArchived ?? false
    };
 
    technician.addServiceRequest(request); 
    await this._technicianRepo.addServiceRequest(technicianId, request);

  }
}