import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { VerifyTechnicianDto } from "../../../dto/technician/TechnicianVerificationDtos";
import { ErrorMessages } from "../../../constants/ErrorMessages";
import { IVerifyTechnicianUseCase } from "../../../interfaces/use-cases/technician/ITechnicianManagementUseCases";

export class VerifyTechnicianUseCase implements IVerifyTechnicianUseCase{
  constructor(
    private readonly _technicianRepo: ITechnicianRepository
  ) {}

  async execute(id: string, dto: VerifyTechnicianDto): Promise<void> {
    const tech = await this._technicianRepo.findById(id);
    if (!tech) throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);


    if (dto.action === "APPROVE") {
      tech.updateVerificationStatus("VERIFIED");
      
      const docs = tech.getDocuments();
      docs.forEach((d) => { d.status = "APPROVED"; });
      tech.updateDocuments(docs); 

    } else if (dto.action === "REJECT") { 
       
      let finalGlobalReason = dto.globalRejectionReason;
      const hasDocumentRejections = dto.documentDecisions?.some((d) => d.status === "REJECTED");

      if (!finalGlobalReason && hasDocumentRejections) {
        finalGlobalReason = "Invalid Documents";
      }

      tech.updateVerificationStatus("REJECTED", finalGlobalReason);
      
      if (dto.documentDecisions && dto.documentDecisions.length > 0) {
        const currentDocs = tech.getDocuments();
        
        dto.documentDecisions.forEach((decision) => {
          const docIndex = currentDocs.findIndex((d) => d.type === decision.type);
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