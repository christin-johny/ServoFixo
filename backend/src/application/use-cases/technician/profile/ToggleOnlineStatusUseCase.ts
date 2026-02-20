import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { IUseCase } from "../../../interfaces/IUseCase";
import { ILogger } from "../../../interfaces/ILogger";
import { ErrorMessages } from "../../../../../../shared/types/enums/ErrorMessages";
import { LogEvents } from "../../../../../../shared/constants/LogEvents";

export interface ToggleStatusInput {
  technicianId: string;
  lat?: number;
  lng?: number;
}

export class ToggleOnlineStatusUseCase implements IUseCase<boolean, [ToggleStatusInput]> {
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(input: ToggleStatusInput): Promise<boolean> {
    const { technicianId, lat, lng } = input;
    
    const tech = await this._technicianRepo.findById(technicianId);
    if (!tech) throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);
 
    if (tech.getIsSuspended()) {
      throw new Error(ErrorMessages.ACCOUNT_BLOCKED);
    }
    
    if (tech.getVerificationStatus() !== "VERIFIED") {
      throw new Error(ErrorMessages.TECH_NOT_VERIFIED);
    }

    const currentStatus = tech.getIsOnline();
    const newStatus = !currentStatus;
 
    if (newStatus === true) { 
      if (lat === undefined || lng === undefined) {
        throw new Error(ErrorMessages.TECH_LOCATION_REQUIRED);
      }
 
      const zoneIds = tech.getZoneIds();
      if (!zoneIds || zoneIds.length === 0) {
        throw new Error(ErrorMessages.TECH_MISSING_ZONES);
      }

      const isInsideZone = await this._technicianRepo.verifyZoneAccess(zoneIds, lat, lng);
      
      if (!isInsideZone) {
        this._logger.warn(`Technician ${technicianId} attempted to go online outside zones`, { lat, lng });
        throw new Error(ErrorMessages.TECH_OUTSIDE_ZONE);
      }
    }
 
    const locationData = (lat !== undefined && lng !== undefined) ? { lat, lng } : undefined;
    
    await this._technicianRepo.updateOnlineStatus(technicianId, newStatus, locationData);

    return newStatus;
  }
}