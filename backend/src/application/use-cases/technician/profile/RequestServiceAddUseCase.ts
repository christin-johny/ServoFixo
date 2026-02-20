import { IUseCase } from "../../../interfaces/IUseCase";
import { ILogger } from "../../../interfaces/ILogger";
import { LogEvents } from "../../../../../../shared/constants/LogEvents";
import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { ServiceRequest } from "../../../../../../shared/types/value-objects/TechnicianTypes";
import { ErrorMessages } from "../../../../../../shared/types/enums/ErrorMessages";

export interface RequestServiceAddInput {
  serviceId: string;
  categoryId: string;
  proofUrl?: string; 
  action: "ADD" | "REMOVE"; 
  isDismissed?: boolean; 
  isArchived?: boolean;  
}

export class RequestServiceAddUseCase implements IUseCase<void, [string, RequestServiceAddInput]> {
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(technicianId: string, input: RequestServiceAddInput): Promise<void> {
    const logData = { 
      technicianId, 
      serviceId: input.serviceId, 
      action: input.action  
    };
    

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