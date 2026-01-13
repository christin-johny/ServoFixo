import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { ILogger } from "../../../interfaces/ILogger";
import { ErrorMessages } from "../../../../../../shared/types/enums/ErrorMessages";
 
export interface UpdateTechnicianDto {
  name?: string;
  email?: string;
  phone?: string;
  experienceSummary?: string;
  
  // Operations
  zoneIds?: string[];
  categoryIds?: string[];
  subServiceIds?: string[];

  // Financials
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}

export class UpdateTechnicianUseCase {
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(id: string, updates: UpdateTechnicianDto): Promise<void> {
    const tech = await this._technicianRepo.findById(id);
    if (!tech) throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);
    
    const props = tech.toProps();
    const t = tech as any; // Accessing private fields via casting (matching your pattern)

    // 1. Basic Profile Updates
    if (updates.name) t._name = updates.name;
    if (updates.email) t._email = updates.email;
    if (updates.phone) t._phone = updates.phone;

    // 2. Profile Details Update
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
    this._logger.info(`Technician ${id} updated by Admin (Full Profile)`);
  }
}