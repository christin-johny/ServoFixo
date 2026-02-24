import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { TechnicianOnboardingInput } from "../../../dto/technician/TechnicianOnboardingDtos";
import { ErrorMessages } from "../../../constants/ErrorMessages";
import { ILogger } from "../../../interfaces/services/ILogger"; 
import { Technician } from "../../../../domain/entities/Technician";
import {
  TechnicianDocument,
  DocumentStatus,
} from "../../../../domain/value-objects/TechnicianTypes";
import { ITechnicianOnboardingUseCase } from "../../../interfaces/use-cases/technician/ITechnicianProfileUseCases";

export class TechnicianOnboardingUseCase
  implements ITechnicianOnboardingUseCase
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

        break;

      case 3:
        if (!input.zoneIds.length)
          throw new Error(ErrorMessages.TECH_MISSING_ZONES);
        technician.updateZones(input.zoneIds);
        this.updateStep(technician, 4);

        break;

      case 4:
        if (!input.agreedToRates)
          throw new Error(ErrorMessages.TECH_RATE_DISAGREE);
        this.updateStep(technician, 5);

        break;

      case 5: { // <--- Add this curly brace to create a block scope
        if (!input.documents || input.documents.length === 0) {
          throw new Error(ErrorMessages.TECH_DOCS_MISSING);
        }
        if (input.documents.length > 6) {
          throw new Error(ErrorMessages.TECH_DOC_LIMIT);
        }

        // Now 'docs' is scoped only to this case block
        const docs: TechnicianDocument[] = input.documents.map((d) => ({
          type: d.type,
          fileUrl: d.fileUrl, // This stores the KEY (e.g., "technician/123/documents/file.pdf")
          fileName: d.fileName,
          status: "PENDING" as DocumentStatus,
          uploadedAt: new Date(),
        }));

        technician.updateDocuments(docs);
        this.updateStep(technician, 6);
        break;
      }

      case 6:
        technician.updateBankDetails(input.bankDetails);

        technician.setOnboardingStep(7);
        technician.setVerificationStatus("VERIFICATION_PENDING");
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
