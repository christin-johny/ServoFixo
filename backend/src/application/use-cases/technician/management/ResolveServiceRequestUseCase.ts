import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { IUseCase } from "../../../interfaces/IUseCase";
import { ResolvePartnerRequestDto } from "../../../dto/admin/ManageRequestDto";
import { ILogger } from "../../../interfaces/ILogger";
import { ErrorMessages } from "../../../../../../shared/types/enums/ErrorMessages";
import { LogEvents } from "../../../../../../shared/constants/LogEvents";
import { PartnerRequestType } from "../../../../../../shared/types/enums/RequestResolutionEnums";
import { Technician } from "../../../../domain/entities/Technician";
import { INotificationService } from "../../../services/INotificationService";

export class ResolveServiceRequestUseCase
  implements IUseCase<void, [string, ResolvePartnerRequestDto]>
{
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _notificationService: INotificationService,
    private readonly _logger: ILogger
  ) {}

  async execute(techId: string, dto: ResolvePartnerRequestDto): Promise<void> {
    const tech: Technician | null = await this._technicianRepo.findById(techId);

    if (!tech) {
      throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);
    }



    try {
      const requests = tech.getServiceRequests();
      const reqIndex = requests.findIndex(
        (r) => r.id === dto.requestId && r.status === "PENDING"
      );

      if (reqIndex === -1) throw new Error(ErrorMessages.REQUEST_NOT_FOUND);

      const serviceReq = requests[reqIndex];
      let categoryRemoved = false;
      const serviceAction = serviceReq.action;

      if (dto.action === "APPROVE") {
        serviceReq.status = "APPROVED";
        const currentServiceIds = [...tech.getSubServiceIds()];
        const currentCategoryIds = [...tech.getCategoryIds()];

        if (serviceReq.action === "ADD") {
          if (!currentServiceIds.includes(serviceReq.serviceId)) {
            currentServiceIds.push(serviceReq.serviceId);
            tech.addCategory(serviceReq.categoryId);
            tech.updateWorkPreferences(tech.getCategoryIds(), currentServiceIds);
          }
        } else if (serviceReq.action === "REMOVE") {
          const updatedServiceIds = currentServiceIds.filter(
            (id) => id !== serviceReq.serviceId
          );

          const hasOtherServicesInCat = requests.some(
            (r) =>
              r.status === "APPROVED" &&
              r.id !== serviceReq.id &&
              r.categoryId === serviceReq.categoryId &&
              updatedServiceIds.includes(r.serviceId)
          );

          if (!hasOtherServicesInCat) categoryRemoved = true;

          const updatedCategoryIds = hasOtherServicesInCat
            ? currentCategoryIds
            : currentCategoryIds.filter((cId) => cId !== serviceReq.categoryId);

          tech.updateWorkPreferences(updatedCategoryIds, updatedServiceIds);
        }
      } else {
        serviceReq.status = "REJECTED";
        serviceReq.adminComments = dto.rejectionReason;
      }

      tech.updateServiceRequests(requests);
      await this._technicianRepo.update(tech);

      await this._notificationService.notifyRequestResolved(techId, {
        type: "SERVICE",
        action: dto.action as "APPROVE" | "REJECT",
        rejectionReason: dto.rejectionReason,
        metadata: {
          requestId: dto.requestId,
          type: PartnerRequestType.SERVICE,
          serviceAction: serviceAction,
          categoryRemoved: String(categoryRemoved),
        },
      });

    } catch (error) {
      this._logger.error(LogEvents.ADMIN_RESOLVE_PARTNER_REQUEST_FAILED, error instanceof Error ? error.message : ErrorMessages.INTERNAL_ERROR);
      throw error;
    }
  }
}