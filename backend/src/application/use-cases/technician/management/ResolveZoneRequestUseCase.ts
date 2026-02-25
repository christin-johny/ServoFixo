import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { ResolvePartnerRequestDto } from "../../../dto/admin/ManageRequestDto";
import { ILogger } from "../../../interfaces/services/ILogger";
import { ErrorMessages } from "../../../constants/ErrorMessages";
import { LogEvents } from "../../../../infrastructure/logging/LogEvents";
import { PartnerRequestType, RequestAction } from "../../../../domain/enums/RequestResolutionEnums";
import { Technician } from "../../../../domain/entities/Technician";
import { INotificationService } from "../../../services/INotificationService";
import { IResolveZoneRequestUseCase } from "../../../interfaces/use-cases/technician/ITechnicianManagementUseCases";

export class ResolveZoneRequestUseCase
  implements IResolveZoneRequestUseCase
{
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _notificationService: INotificationService,
    private readonly _logger: ILogger
  ) {}

  async execute(techId: string, dto: ResolvePartnerRequestDto): Promise<void> {
    const tech: Technician | null = await this._technicianRepo.findById(techId);
    if (!tech) throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);


    try {
      const requests = tech.getZoneRequests();
      const reqIndex = requests.findIndex(
        (r) => r.id === dto.requestId && r.status === "PENDING"
      );

      if (reqIndex === -1) throw new Error(ErrorMessages.REQUEST_NOT_FOUND);

      if (dto.action === RequestAction.APPROVE) {
        requests[reqIndex].status = "APPROVED";
        tech.updateZones([requests[reqIndex].requestedZoneId]);
      } else {
        requests[reqIndex].status = "REJECTED";
        requests[reqIndex].adminComments = dto.rejectionReason;
      }

      tech.updateZoneRequests(requests);
      await this._technicianRepo.update(tech);

      await this._notificationService.notifyRequestResolved(techId, {
        type: "ZONE",
        action: dto.action as "APPROVE" | "REJECT",
        rejectionReason: dto.rejectionReason,
        metadata: {
          requestId: dto.requestId,
          type: PartnerRequestType.ZONE,
        },
      });

    } catch (error) {
      this._logger.error(LogEvents.ADMIN_RESOLVE_PARTNER_REQUEST_FAILED, error instanceof Error ? error.message : ErrorMessages.INTERNAL_ERROR);
      throw error;
    }
  }
}