import { ITechnicianRepository } from "../../../../domain/repositories/ITechnicianRepository";
import { IUseCase } from "../../../interfaces/IUseCase";
import { AdminTechnicianProfileDto } from "../../../dto/technician/TechnicianVerificationDtos";
import { TechnicianMapper } from "../../../mappers/TechnicianMapper";
import { ILogger } from "../../../interfaces/ILogger";
import { ErrorMessages } from "../../../../../../shared/types/enums/ErrorMessages";

export class GetTechnicianFullProfileUseCase
  implements IUseCase<AdminTechnicianProfileDto, [string]>
{
  constructor(
    private readonly _technicianRepo: ITechnicianRepository,
    private readonly _logger: ILogger
  ) {}

  async execute(technicianId: string): Promise<AdminTechnicianProfileDto> {
    const tech = await this._technicianRepo.findById(technicianId);

    if (!tech) {
      throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);
    }

    return TechnicianMapper.toAdminProfile(tech);
  }
}
