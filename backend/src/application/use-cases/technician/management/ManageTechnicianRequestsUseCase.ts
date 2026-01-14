import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { IUseCase } from "../../../interfaces/IUseCase";
import { ResolvePartnerRequestDto } from "../../../dto/admin/ManageRequestDto";
import { ILogger } from "../../../interfaces/ILogger";
import { ErrorMessages } from "../../../../../../shared/types/enums/ErrorMessages";
import { LogEvents } from "../../../../../../shared/constants/LogEvents";
import {
  RequestAction,
  PartnerRequestType,
} from "../../../../../../shared/types/enums/RequestResolutionEnums";
import { Technician } from "../../../../domain/entities/Technician";

export class ManageTechnicianRequestsUseCase
  implements IUseCase<void, [string, ResolvePartnerRequestDto]>
{
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(techId: string, dto: ResolvePartnerRequestDto): Promise<void> {
    const tech: Technician | null = await this._technicianRepo.findById(techId);

    if (!tech) {
      throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);
    }

    this._logger.info(LogEvents.ADMIN_RESOLVE_PARTNER_REQUEST_INIT, {
      techId,
      type: dto.requestType,
    });

    try {
      // ✅ Using switch to route to specific handlers
      switch (dto.requestType) {
        case PartnerRequestType.SERVICE:
          this.handleServiceRequest(tech, dto);
          break;
        case PartnerRequestType.ZONE:
          this.handleZoneRequest(tech, dto);
          break;
        case PartnerRequestType.BANK:
          this.handleBankRequest(tech, dto);
          break;
        default:
          throw new Error(ErrorMessages.INVALID_DATA);
      }

      // ✅ Persistence: This triggers the update call to MongoDB
      await this._technicianRepo.update(tech);
      this._logger.info(LogEvents.ADMIN_RESOLVE_PARTNER_REQUEST_SUCCESS, {
        techId,
        requestId: dto.requestId,
      });
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : ErrorMessages.INTERNAL_ERROR;
      this._logger.error(LogEvents.ADMIN_RESOLVE_PARTNER_REQUEST_FAILED, msg);
      throw error;
    }
  }

  private handleServiceRequest(
    tech: Technician,
    dto: ResolvePartnerRequestDto
  ): void {
    const requests = tech.getServiceRequests();
    const reqIndex = requests.findIndex(
      (r) => r.id === dto.requestId && r.status === "PENDING"
    );

    if (reqIndex === -1) throw new Error(ErrorMessages.REQUEST_NOT_FOUND);

    const approvedRequest = requests[reqIndex];

    if (dto.action === "APPROVE") {
      approvedRequest.status = "APPROVED";

      const currentServiceIds = tech.getSubServiceIds();
      const currentCategoryIds = tech.getCategoryIds();

      if (approvedRequest.action === "ADD") { 
        if (!currentServiceIds.includes(approvedRequest.serviceId)) {
          currentServiceIds.push(approvedRequest.serviceId);
          tech.addCategory(approvedRequest.categoryId);
          tech.updateWorkPreferences(tech.getCategoryIds(), currentServiceIds);
        }
      } else if (approvedRequest.action === "REMOVE") {
 
        const updatedServiceIds = currentServiceIds.filter(
          (id) => id !== approvedRequest.serviceId
        ); 
        const hasOtherServicesInCat = requests.some(
          (r) =>
            r.status === "APPROVED" &&
            r.serviceId !== approvedRequest.serviceId &&  
            updatedServiceIds.includes(r.serviceId) && 
            r.categoryId === approvedRequest.categoryId  
        );
 
        const updatedCategoryIds = hasOtherServicesInCat
          ? currentCategoryIds
          : currentCategoryIds.filter(
              (cId) => cId !== approvedRequest.categoryId
            );

        tech.updateWorkPreferences(updatedCategoryIds, updatedServiceIds);
      }
    } else {
      approvedRequest.status = "REJECTED";
      approvedRequest.adminComments = dto.rejectionReason;
    }

    tech.updateServiceRequests(requests);
  }

  private handleZoneRequest(
    tech: Technician,
    dto: ResolvePartnerRequestDto
  ): void {
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
  }

  private handleBankRequest(
    tech: Technician,
    dto: ResolvePartnerRequestDto
  ): void {
    const requests = tech.getBankUpdateRequests();
    const reqIndex = requests.findIndex(
      (r) => r.id === dto.requestId && r.status === "PENDING"
    );

    if (reqIndex === -1) throw new Error(ErrorMessages.REQUEST_NOT_FOUND);

    if (dto.action === RequestAction.APPROVE) {
      requests[reqIndex].status = "APPROVED";

      tech.updateBankDetails({
        accountHolderName: requests[reqIndex].accountHolderName,
        accountNumber: requests[reqIndex].accountNumber,
        bankName: requests[reqIndex].bankName,
        ifscCode: requests[reqIndex].ifscCode,
        upiId: requests[reqIndex].upiId,
      });

      tech.updatePayoutStatus("ACTIVE");
    } else {
      requests[reqIndex].status = "REJECTED";
      requests[reqIndex].adminComments = dto.rejectionReason;

      if (tech.getBankDetails()) {
        tech.updatePayoutStatus("ACTIVE");
      }
    }

    tech.updateBankUpdateRequests(requests);
  }
}
