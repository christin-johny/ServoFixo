import { Request, Response } from "express";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import {
  ErrorMessages,
  SuccessMessages,
} from "../../../../../shared/types/enums/ErrorMessages";
import { IUseCase } from "../../../application/interfaces/IUseCase";
import { ILogger } from "../../../application/interfaces/ILogger";
import { Technician } from "../../../domain/entities/Technician";
import { LogEvents } from "../../../../../shared/constants/LogEvents"; 
import { UploadTechnicianFileInput } from "../../../application/use-cases/technician/profile/UploadTechnicianFileUseCase";
import { ToggleStatusInput } from "../../../application/use-cases/technician/profile/ToggleOnlineStatusUseCase";
import {
  TechnicianOnboardingInput,
  OnboardingStep1Dto,
  OnboardingStep2Dto,
  OnboardingStep3Dto,
  OnboardingStep4Dto,
  OnboardingStep5Dto,
  OnboardingStep6Dto,
} from "../../../application/dto/technician/TechnicianOnboardingDtos";

export class TechnicianProfileController {
  constructor(
    private readonly _onboardingUseCase: IUseCase<
      boolean,
      [TechnicianOnboardingInput]
    >,
    private readonly _getProfileUseCase: IUseCase<Technician | null, [string]>,
    private readonly _uploadFileUseCase: IUseCase<
      string,
      [string, UploadTechnicianFileInput]
    >,
    private readonly _toggleStatusUseCase: IUseCase<
      boolean,
      [ToggleStatusInput]
    >,
    private readonly _resubmitProfileUseCase: IUseCase<void, [string]>,
    private readonly _logger: ILogger
  ) {}

  getOnboardingStatus = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const technicianId = (req as any).userId as string;

      this._logger.info(LogEvents.TECH_GET_ONBOARDING_STATUS_INIT, {
        technicianId,
      });

      if (!technicianId)
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: ErrorMessages.UNAUTHORIZED });

      const technician = await this._getProfileUseCase.execute(technicianId);
      if (!technician)
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: ErrorMessages.TECHNICIAN_NOT_FOUND });

      return res.status(StatusCodes.OK).json({
        id: technician.getId(),

        onboardingStep: technician.getOnboardingStep(),
        verificationStatus: technician.getVerificationStatus(),
        availability: { isOnline: technician.getIsOnline() },
        globalRejectionReason: technician.getVerificationReason(),

        personalDetails: {
          name: technician.getName(),
          email: technician.getEmail(),
          phone: technician.getPhone(),
          avatarUrl: technician.getAvatarUrl(),
          bio: technician.getBio(),
          experienceSummary: technician.getExperienceSummary(),
        },

        categoryIds: technician.getCategoryIds(),
        subServiceIds: technician.getSubServiceIds(),

        zoneIds: technician.getZoneIds(),

        documents: technician.getDocuments().map((doc) => ({
          type: doc.type,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          status: doc.status,
          rejectionReason: doc.rejectionReason,
        })),

        bankDetails: technician.getBankDetails() || null,
      });
    } catch (err) {
      return this.handleError(err, res);
    }
  };

  updatePersonalDetails = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      this._logger.info(LogEvents.TECH_UPDATE_DETAILS_INIT, {
        step: 1,
        userId: (req as any).userId,
      });

      const input: OnboardingStep1Dto = {
        ...req.body,
        step: 1,
        technicianId: (req as any).userId,
      };
      await this._onboardingUseCase.execute(input);
      return res
        .status(StatusCodes.OK)
        .json({ message: SuccessMessages.TECH_STEP_SAVED, nextStep: 2 });
    } catch (err) {
      return this.handleError(err, res);
    }
  };

  updateWorkPreferences = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      this._logger.info(LogEvents.TECH_UPDATE_DETAILS_INIT, {
        step: 2,
        userId: (req as any).userId,
      });

      const input: OnboardingStep2Dto = {
        ...req.body,
        step: 2,
        technicianId: (req as any).userId,
      };
      await this._onboardingUseCase.execute(input);
      return res
        .status(StatusCodes.OK)
        .json({ message: SuccessMessages.TECH_STEP_SAVED, nextStep: 3 });
    } catch (err) {
      return this.handleError(err, res);
    }
  };

  updateZones = async (req: Request, res: Response): Promise<Response> => {
    try {
      this._logger.info(LogEvents.TECH_UPDATE_DETAILS_INIT, {
        step: 3,
        userId: (req as any).userId,
      });

      const input: OnboardingStep3Dto = {
        ...req.body,
        step: 3,
        technicianId: (req as any).userId,
      };
      await this._onboardingUseCase.execute(input);
      return res
        .status(StatusCodes.OK)
        .json({ message: SuccessMessages.TECH_STEP_SAVED, nextStep: 4 });
    } catch (err) {
      return this.handleError(err, res);
    }
  };

  updateRateAgreement = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      this._logger.info(LogEvents.TECH_UPDATE_DETAILS_INIT, {
        step: 4,
        userId: (req as any).userId,
      });

      const input: OnboardingStep4Dto = {
        ...req.body,
        step: 4,
        technicianId: (req as any).userId,
      };
      await this._onboardingUseCase.execute(input);
      return res
        .status(StatusCodes.OK)
        .json({ message: SuccessMessages.TECH_STEP_SAVED, nextStep: 5 });
    } catch (err) {
      return this.handleError(err, res);
    }
  };

  updateDocuments = async (req: Request, res: Response): Promise<Response> => {
    try {
      this._logger.info(LogEvents.TECH_UPDATE_DETAILS_INIT, {
        step: 5,
        userId: (req as any).userId,
      });

      const input: OnboardingStep5Dto = {
        ...req.body,
        step: 5,
        technicianId: (req as any).userId,
      };
      await this._onboardingUseCase.execute(input);
      return res
        .status(StatusCodes.OK)
        .json({ message: SuccessMessages.TECH_DOC_UPLOADED, nextStep: 6 });
    } catch (err) {
      return this.handleError(err, res);
    }
  };

  updateBankDetails = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      this._logger.info(LogEvents.TECH_UPDATE_DETAILS_INIT, {
        step: 6,
        userId: (req as any).userId,
      });

      const input: OnboardingStep6Dto = {
        ...req.body,
        step: 6,
        technicianId: (req as any).userId,
      };
      await this._onboardingUseCase.execute(input);
      return res
        .status(StatusCodes.OK)
        .json({ message: SuccessMessages.TECH_PROFILE_SUBMITTED });
    } catch (err) {
      return this.handleError(err, res);
    }
  };

  uploadAvatar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = (req as any).userId;
      this._logger.info(LogEvents.AVATAR_UPLOAD_INIT, { technicianId });

      if (!req.file)
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: ErrorMessages.NO_FILE });

      const url = await this._uploadFileUseCase.execute(technicianId, {
        fileBuffer: req.file.buffer,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        folder: "avatars",
      });

      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.TECH_DOC_UPLOADED,
        url: url,
      });
    } catch (err) {
      return this.handleError(err, res);
    }
  };

  uploadDocument = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = (req as any).userId;

      this._logger.info(LogEvents.TECH_DOC_UPLOAD_INIT, { technicianId });

      if (!req.file)
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: ErrorMessages.NO_FILE });

      const url = await this._uploadFileUseCase.execute(technicianId, {
        fileBuffer: req.file.buffer,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        folder: "documents",
      });

      return res.status(StatusCodes.OK).json({
        message: SuccessMessages.TECH_DOC_UPLOADED,
        url: url,
      });
    } catch (err) {
      return this.handleError(err, res);
    }
  };
  toggleOnlineStatus = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const technicianId = (req as any).userId;
      const { lat, lng } = req.body;

      this._logger.info(LogEvents.TECH_STATUS_TOGGLE_INIT, {
        technicianId,
        lat,
        lng,
      });

      const newStatus = await this._toggleStatusUseCase.execute({
        technicianId,
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
      });

      return res.status(StatusCodes.OK).json({
        success: true,
        isOnline: newStatus,
        message: newStatus
          ? SuccessMessages.TECH_ONLINE
          : SuccessMessages.TECH_OFFLINE,
      });
    } catch (err) {
      return this.handleError(err, res);
    }
  };
  resubmitProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = (req as any).userId;
      this._logger.info("Technician Resubmission Initiated", { technicianId });

      await this._resubmitProfileUseCase.execute(technicianId);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: SuccessMessages.TECH_PROFILE_SUBMITTED,
      });
    } catch (err) {
      return this.handleError(err, res);
    }
  };

  private handleError(err: unknown, res: Response): Response {
    const errorMessage = err instanceof Error ? err.message : String(err);
    this._logger.error(LogEvents.TECH_PROFILE_ERROR, errorMessage);

    if (Object.values(ErrorMessages).includes(errorMessage as ErrorMessages)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: errorMessage });
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: ErrorMessages.INTERNAL_ERROR });
  }
}
