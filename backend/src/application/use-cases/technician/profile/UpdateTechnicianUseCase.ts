import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { ILogger } from "../../../interfaces/ILogger";
import { ErrorMessages } from "../../../../../../shared/types/enums/ErrorMessages";

export interface UpdateTechnicianDto {
  name?: string;
  email?: string;
  phone?: string;
  experienceSummary?: string;
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
    
    
    tech.updateProfile({
        bio: props.bio || "",
        experienceSummary: updates.experienceSummary || props.experienceSummary || "",
        avatarUrl: props.avatarUrl
    });
    const t = tech as any;
    if(updates.name) t._name = updates.name;
    if(updates.email) t._email = updates.email;
    if(updates.phone) t._phone = updates.phone;
    t._updatedAt = new Date();

    await this._technicianRepo.update(tech);
    this._logger.info(`Technician ${id} updated by Admin`);
  }
}