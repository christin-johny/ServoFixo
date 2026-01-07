import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { IUseCase } from "../../../interfaces/IUseCase";
import { TechnicianOnboardingInput } from "../../../dto/technician/TechnicianOnboardingDtos";
import { ErrorMessages } from "../../../../../../shared/types/enums/ErrorMessages";
import { ILogger } from "../../../interfaces/ILogger";
import { LogEvents } from "../../../../../../shared/constants/LogEvents";
import { Technician } from "../../../../domain/entities/Technician";
import {
  TechnicianDocument,
  DocumentStatus,
} from "../../../../../../shared/types/value-objects/TechnicianTypes";

export class TechnicianOnboardingUseCase
  implements IUseCase<boolean, [TechnicianOnboardingInput]>
{
  constructor(
    private readonly _technicianRepository: ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(input: TechnicianOnboardingInput): Promise<boolean> {
    const technician = await this._technicianRepository.findById(
      input.technicianId
    );

    if (!technician) {
      throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);
    }

    switch (input.step) {
      case 1:
        technician.updateProfile({
          bio: input.bio,
          experienceSummary: input.experienceSummary,
          avatarUrl: input.avatarUrl,
        });
        this.updateStep(technician, 2);
        this._logger.info(
          `${LogEvents.TECH_ONBOARDING_STEP_1_SUCCESS}: ${technician.getId()}`
        );
        break;

      case 2:
        if (!input.categoryIds.length || !input.subServiceIds.length) {
          throw new Error(ErrorMessages.TECH_MISSING_CATS);
        }
        technician.updateWorkPreferences(
          input.categoryIds,
          input.subServiceIds
        );
        this.updateStep(technician, 3);
        this._logger.info(
          `${LogEvents.TECH_ONBOARDING_STEP_2_SUCCESS}: ${technician.getId()}`
        );
        break;

      case 3:
        if (!input.zoneIds.length)
          throw new Error(ErrorMessages.TECH_MISSING_ZONES);
        technician.updateZones(input.zoneIds);
        this.updateStep(technician, 4);
        this._logger.info(
          `${LogEvents.TECH_ONBOARDING_STEP_3_SUCCESS}: ${technician.getId()}`
        );
        break;

      case 4:
        if (!input.agreedToRates)
          throw new Error(ErrorMessages.TECH_RATE_DISAGREE);
        this.updateStep(technician, 5);
        this._logger.info(
          `${LogEvents.TECH_ONBOARDING_STEP_4_SUCCESS}: ${technician.getId()}`
        );
        break;

      case 5:
        if (!input.documents || input.documents.length === 0) {
          throw new Error(ErrorMessages.TECH_DOCS_MISSING);
        }
        if (input.documents.length > 6) {
          throw new Error(ErrorMessages.TECH_DOC_LIMIT);
        }

        const docs: TechnicianDocument[] = input.documents.map((d) => ({
          type: d.type,
          fileUrl: d.fileUrl,
          fileName: d.fileName,
          status: "PENDING" as DocumentStatus,
          uploadedAt: new Date(),
        }));

        technician.updateDocuments(docs);
        this.updateStep(technician, 6);
        this._logger.info(
          `${LogEvents.TECH_ONBOARDING_STEP_5_SUCCESS}: ${technician.getId()}`
        );
        break;

      case 6:
        technician.updateBankDetails(input.bankDetails);

        technician.setOnboardingStep(7);
        technician.setVerificationStatus("VERIFICATION_PENDING");

        this._logger.info(
          `${LogEvents.TECH_ONBOARDING_STEP_6_SUCCESS}: ${technician.getId()}`
        );
        this._logger.info(
          `${LogEvents.TECH_PROFILE_SUBMITTED}: ${technician.getId()}`
        );
        break;

      default:
        throw new Error(ErrorMessages.TECH_INVALID_STEP);
    }

    await this._technicianRepository.update(technician);
    return true;
  }

  private updateStep(technician: Technician, nextStep: number) {
    if (technician.getOnboardingStep() < nextStep) {
      technician.setOnboardingStep(nextStep);
    }
  }
}
