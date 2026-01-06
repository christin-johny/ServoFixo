import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { IUseCase } from "../../../interfaces/IUseCase";
import { VerifyTechnicianDto } from "../../../dto/technician/TechnicianVerificationDtos";
import { ILogger } from "../../../interfaces/ILogger";
import { ErrorMessages } from "../../../../../../shared/types/enums/ErrorMessages";

export class VerifyTechnicianUseCase implements IUseCase<void, [string, VerifyTechnicianDto]> {
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(id: string, dto: VerifyTechnicianDto): Promise<void> {
    const tech = await this._technicianRepo.findById(id);
    if (!tech) throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);

    this._logger.info(`Processing Verification for ${id}: ${dto.action}`);

    if (dto.action === "APPROVE") {
      tech.updateVerificationStatus("VERIFIED");
      
      const docs = tech.getDocuments();
      docs.forEach(d => d.status = "APPROVED");
      tech.updateDocuments(docs); 

    } else if (dto.action === "REJECT") { 
      tech.updateVerificationStatus("REJECTED", dto.globalRejectionReason);
      
      if (dto.documentDecisions && dto.documentDecisions.length > 0) {
        const currentDocs = tech.getDocuments();
        
        dto.documentDecisions.forEach(decision => {
          const docIndex = currentDocs.findIndex(d => d.type === decision.type);
          if (docIndex !== -1) {
            currentDocs[docIndex].status = decision.status; 
            if (decision.status === "REJECTED") {
              currentDocs[docIndex].rejectionReason = decision.rejectionReason;
            }
          }
        });
        tech.updateDocuments(currentDocs);
      }
    }

    await this._technicianRepo.update(tech);
  }
}