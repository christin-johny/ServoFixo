import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { ErrorMessages } from "../../../constants/ErrorMessages";
import { UpdateTechnicianDto } from "../../../dto/technician/UpdateTechnicianDto";
import { IUpdateTechnicianUseCase } from "../../../interfaces/use-cases/technician/ITechnicianManagementUseCases";
 


export class UpdateTechnicianUseCase implements IUpdateTechnicianUseCase{
  constructor(
    private readonly _technicianRepo: ITechnicianRepository
  ) {}

  async execute(id: string, updates: UpdateTechnicianDto): Promise<void> {
    const tech = await this._technicianRepo.findById(id);
    if (!tech) throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);
    
    const props = tech.toProps();
    const t = tech as any;  
 
    if (updates.name) t._name = updates.name;
    if (updates.email) t._email = updates.email;
    if (updates.phone) t._phone = updates.phone;
 
    tech.updateProfile({
        bio: props.bio || "",
        experienceSummary: updates.experienceSummary || props.experienceSummary || "",
        avatarUrl: props.avatarUrl
    });
 
    if (updates.zoneIds) {
        t._zoneIds = updates.zoneIds;
    }
    if (updates.categoryIds) {
        t._categoryIds = updates.categoryIds;
    }
    if (updates.subServiceIds) {
        t._subServiceIds = updates.subServiceIds;
    }
 
    if (updates.bankDetails) { 
        t._bankDetails = {
            accountHolderName: updates.bankDetails.accountHolderName,
            accountNumber: updates.bankDetails.accountNumber,
            ifscCode: updates.bankDetails.ifscCode,
            bankName: updates.bankDetails.bankName
        };
    }

    t._updatedAt = new Date();

    await this._technicianRepo.update(tech);
  }
}