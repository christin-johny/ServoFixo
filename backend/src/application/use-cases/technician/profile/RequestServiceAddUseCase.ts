import { IUseCase } from "../../../interfaces/IUseCase";
import { ILogger } from "../../../interfaces/ILogger";
import { LogEvents } from "../../../../../../shared/constants/LogEvents";
import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { ServiceRequest } from "../../../../../../shared/types/value-objects/TechnicianTypes";
import { ErrorMessages } from "../../../../../../shared/types/enums/ErrorMessages";

export interface RequestServiceAddInput {
  serviceId: string;
  categoryId: string;
  proofUrl?: string; // Certificate URL
}

export class RequestServiceAddUseCase implements IUseCase<void, [string, RequestServiceAddInput]> {
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(technicianId: string, input: RequestServiceAddInput): Promise<void> {
    const logData = { technicianId, serviceId: input.serviceId };
    this._logger.info(LogEvents.TECH_SERVICE_REQUEST_INIT, logData);

    const technician = await this._technicianRepo.findById(technicianId);
    if (!technician) {
      this._logger.error(`${LogEvents.TECH_NOT_FOUND}: Technician ${technicianId}`);
      throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);
    }

    // 2. Construct Request Object (Value Object)
    const request: ServiceRequest = {
      serviceId: input.serviceId,
      categoryId: input.categoryId,
      action: "ADD",
      proofUrl: input.proofUrl,
      status: "PENDING",
      requestedAt: new Date()
    };

    // 3. Domain Logic: Validate (No duplicates) & Add to Entity
    // This throws if the service is already active or pending
    technician.addServiceRequest(request);

    // 4. Persistence: Save only the new request
    await this._technicianRepo.addServiceRequest(technicianId, request);

    this._logger.info(LogEvents.TECH_SERVICE_REQUEST_SUCCESS, logData);
  }
}