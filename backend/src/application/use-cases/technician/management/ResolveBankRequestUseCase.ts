import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { IUseCase } from "../../../interfaces/IUseCase";
import { ResolvePartnerRequestDto } from "../../../dto/admin/ManageRequestDto";
import { ILogger } from "../../../interfaces/ILogger";
import { ErrorMessages } from "../../../../../../shared/types/enums/ErrorMessages";
import { LogEvents } from "../../../../../../shared/constants/LogEvents";
import { PartnerRequestType, RequestAction } from "../../../../../../shared/types/enums/RequestResolutionEnums";
import { Technician } from "../../../../domain/entities/Technician";
import { INotificationService } from "../../../services/INotificationService";

export class ResolveBankRequestUseCase
  implements IUseCase<void, [string, ResolvePartnerRequestDto]>
{
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _notificationService: INotificationService,
    private readonly _logger: ILogger
  ) {}

  async execute(techId: string, dto: ResolvePartnerRequestDto): Promise<void> {
    const tech: Technician | null = await this._technicianRepo.findById(techId);
    if (!tech) throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);

    this._logger.info(LogEvents.ADMIN_RESOLVE_PARTNER_REQUEST_INIT, { techId, type: PartnerRequestType.BANK });

    try {
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
        if (tech.getBankDetails()) tech.updatePayoutStatus("ACTIVE");
      }

      tech.updateBankUpdateRequests(requests);
      await this._technicianRepo.update(tech);

      await this._notificationService.notifyRequestResolved(techId, {
        type: "BANK",
        action: dto.action as "APPROVE" | "REJECT",
        rejectionReason: dto.rejectionReason,
        metadata: {
          requestId: dto.requestId,
          type: PartnerRequestType.BANK,
        },
      });

      this._logger.info(LogEvents.ADMIN_RESOLVE_PARTNER_REQUEST_SUCCESS, { techId, requestId: dto.requestId });
    } catch (error) {
      this._logger.error(LogEvents.ADMIN_RESOLVE_PARTNER_REQUEST_FAILED, error instanceof Error ? error.message : ErrorMessages.INTERNAL_ERROR);
      throw error;
    }
  }
}