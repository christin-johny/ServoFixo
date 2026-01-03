import { Request, Response } from "express";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { Technician } from "../../../domain/entities/Technician";
import { IUseCase } from "../../../application/interfaces/IUseCase";
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";
 
interface TechnicianProfileResponseDto {
  id: string;
  onboardingStep: number;
  verificationStatus: string;
  availability: {
    isOnline: boolean;
  };
  personalDetails: {
    name: string;
    email: string;
    phone: string;
    avatarUrl?: string;
    bio?: string;
    experienceSummary?: string;
  };
}

export class TechnicianProfileController {
  constructor(
    private readonly _getProfileUseCase: IUseCase<Technician | null, [string]>, 
    private readonly _logger: ILogger
  ) {}

  getOnboardingStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = (req as any).userId as string;

      if (!technicianId) {
          return res.status(StatusCodes.UNAUTHORIZED).json({ error: ErrorMessages.UNAUTHORIZED });
      }
      
      this._logger.info(`${LogEvents.PROFILE_FETCH_INIT}: ${technicianId}`);

      const technician = await this._getProfileUseCase.execute(technicianId);
      
      if (!technician) {
          return res.status(StatusCodes.NOT_FOUND).json({ error: ErrorMessages.TECHNICIAN_NOT_FOUND });
      }

      // ✅ 2. Map Entity to DTO (Strict Abstraction)
      const responseDto: TechnicianProfileResponseDto = {
        id: technician.getId(),
        onboardingStep: technician.getOnboardingStep(),
        verificationStatus: technician.getVerificationStatus(),
        availability: {
          isOnline: technician.getIsOnline() // Now valid
        },
        personalDetails: {
           name: technician.getName(),
           email: technician.getEmail(),
           phone: technician.getPhone(),
           avatarUrl: technician.getAvatarUrl(),
           bio: technician.getBio(),
           experienceSummary: technician.getExperienceSummary()
        }
      };

      return res.status(StatusCodes.OK).json(responseDto);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this._logger.error(LogEvents.PROFILE_FETCH_FAILED, errorMessage);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
    }
  };
}