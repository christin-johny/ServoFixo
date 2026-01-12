import { IUseCase } from "../../../interfaces/IUseCase";
import { ILogger } from "../../../interfaces/ILogger";
import { LogEvents } from "../../../../../../shared/constants/LogEvents";
import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { ZoneRequest } from "../../../../../../shared/types/value-objects/TechnicianTypes";
import { ErrorMessages } from "../../../../../../shared/types/enums/ErrorMessages";

export interface RequestZoneTransferInput {
  currentZoneId: string;
  requestedZoneId: string;
}

export class RequestZoneTransferUseCase implements IUseCase<void, [string, RequestZoneTransferInput]> {
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _logger: ILogger
    // TODO: Inject IJobRepository here to check for active jobs (PRD Rule 5.1)
  ) {}

  async execute(technicianId: string, input: RequestZoneTransferInput): Promise<void> {
    const logData = { technicianId, toZone: input.requestedZoneId };
    this._logger.info(LogEvents.TECH_ZONE_REQUEST_INIT, logData);

    const technician = await this._technicianRepo.findById(technicianId);
    if (!technician) {
      throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);
    }

    // TODO: PRD Validation Rule
    // const activeJobs = await this._jobRepo.countActiveJobs(technicianId);
    // if (activeJobs > 0) throw new Error("Cannot change zone while having active jobs.");

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
      requestedAt: new Date()
    };

    // 3. Persist
    await this._technicianRepo.addZoneRequest(technicianId, request);

    this._logger.info(LogEvents.TECH_ZONE_REQUEST_SUCCESS, logData);
  }
}