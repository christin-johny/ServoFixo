import { Request, Response } from "express";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import {
  ErrorMessages,
  SuccessMessages,
} from "../../../../../shared/types/enums/ErrorMessages";
import { IUseCase } from "../../../application/interfaces/IUseCase";
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";
import { TechnicianResponseDto } from "../../../application/dto/technician/TechnicianResponseDto";
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
 
import { 
  RequestServiceAddInput, 
  RequestZoneTransferInput, 
  RequestBankUpdateInput 
} from "../../../application/dto/technician/TechnicianRequestDtos";

import { IServiceCategoryRepository } from "../../../domain/repositories/IServiceCategoryRepository";
import { IServiceItemRepository } from "../../../domain/repositories/IServiceItemRepository";
import { IZoneRepository } from "../../../domain/repositories/IZoneRepository";
 
interface AuthenticatedRequest extends Request {
  userId?: string;
  file?: Express.Multer.File;
}

export class TechnicianProfileController {
  constructor(
    private readonly _onboardingUseCase: IUseCase<boolean, [TechnicianOnboardingInput]>,
    private readonly _getProfileUseCase: IUseCase<TechnicianResponseDto | null, [string]>,
    private readonly _uploadFileUseCase: IUseCase<string, [string, UploadTechnicianFileInput]>,
    private readonly _toggleStatusUseCase: IUseCase<boolean, [ToggleStatusInput]>,
    private readonly _resubmitProfileUseCase: IUseCase<void, [string]>,
    
    private readonly _requestServiceAddUseCase: IUseCase<void, [string, RequestServiceAddInput]>,
    private readonly _requestZoneTransferUseCase: IUseCase<void, [string, RequestZoneTransferInput]>,
    private readonly _requestBankUpdateUseCase: IUseCase<void, [string, RequestBankUpdateInput]>, 
    private readonly _dismissRequestUseCase: IUseCase<void, [string, string]>,

    private readonly _logger: ILogger
  ) {}

  getOnboardingStatus = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const technicianId = (req as AuthenticatedRequest).userId;

      this._logger.info(`${LogEvents.TECH_GET_ONBOARDING_STATUS_INIT}: ${technicianId}`);

      if (!technicianId) {
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: ErrorMessages.UNAUTHORIZED });
      }

      const profileDto = await this._getProfileUseCase.execute(technicianId);

      if (!profileDto) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: ErrorMessages.TECHNICIAN_NOT_FOUND });
      }

      return res.status(StatusCodes.OK).json(profileDto);
    } catch (err) {
      return this.handleError(err, res);
    }
  };

  updatePersonalDetails = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const technicianId = (req as AuthenticatedRequest).userId;

      this._logger.info(`${LogEvents.TECH_UPDATE_DETAILS_INIT}: Step 1 - ${technicianId}`);

      if (!technicianId)
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: ErrorMessages.UNAUTHORIZED });

      const input: OnboardingStep1Dto = {
        ...req.body,
        step: 1,
        technicianId: technicianId,
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
      const technicianId = (req as AuthenticatedRequest).userId;
      this._logger.info(`${LogEvents.TECH_UPDATE_DETAILS_INIT}: Step 2 - ${technicianId}`);

      if (!technicianId)
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: ErrorMessages.UNAUTHORIZED });

      const input: OnboardingStep2Dto = { ...req.body, step: 2, technicianId };
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
      const technicianId = (req as AuthenticatedRequest).userId;
      this._logger.info(`${LogEvents.TECH_UPDATE_DETAILS_INIT}: Step 3 - ${technicianId}`);

      if (!technicianId)
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: ErrorMessages.UNAUTHORIZED });

      const input: OnboardingStep3Dto = { ...req.body, step: 3, technicianId };
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
      const technicianId = (req as AuthenticatedRequest).userId;
      this._logger.info(`${LogEvents.TECH_UPDATE_DETAILS_INIT}: Step 4 - ${technicianId}`);

      if (!technicianId)
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: ErrorMessages.UNAUTHORIZED });

      const input: OnboardingStep4Dto = { ...req.body, step: 4, technicianId };
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
      const technicianId = (req as AuthenticatedRequest).userId;
      this._logger.info(`${LogEvents.TECH_UPDATE_DETAILS_INIT}: Step 5 - ${technicianId}`);

      if (!technicianId)
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: ErrorMessages.UNAUTHORIZED });

      const input: OnboardingStep5Dto = { ...req.body, step: 5, technicianId };
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
      const technicianId = (req as AuthenticatedRequest).userId;
      this._logger.info(`${LogEvents.TECH_UPDATE_DETAILS_INIT}: Step 6 - ${technicianId}`);

      if (!technicianId)
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: ErrorMessages.UNAUTHORIZED });

      const input: OnboardingStep6Dto = { ...req.body, step: 6, technicianId };
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
      const technicianId = (req as AuthenticatedRequest).userId;
      const file = (req as AuthenticatedRequest).file;

      this._logger.info(`${LogEvents.AVATAR_UPLOAD_INIT}: ${technicianId}`);

      if (!technicianId)
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: ErrorMessages.UNAUTHORIZED });
      if (!file)
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: ErrorMessages.NO_FILE });

      const url = await this._uploadFileUseCase.execute(technicianId, {
        fileBuffer: file.buffer,
        fileName: file.originalname,
        mimeType: file.mimetype,
        folder: "avatars",
      });

      return res
        .status(StatusCodes.OK)
        .json({ message: SuccessMessages.TECH_DOC_UPLOADED, url: url });
    } catch (err) {
      return this.handleError(err, res);
    }
  };
  dismissNotification = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = (req as AuthenticatedRequest).userId;
      const { requestId } = req.params;

      if (!technicianId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: ErrorMessages.UNAUTHORIZED });
      }

      this._logger.info(LogEvents.TECH_DISMISS_REQUEST_INIT, {technicianId,requestId});

      await this._dismissRequestUseCase.execute(technicianId, requestId);

      return res.status(StatusCodes.OK).json({ 
        success: true, 
        message: SuccessMessages.TECH_REQUEST_DISMISSED 
      });

    } catch (err) {
      return this.handleError(err, res);
    }
  };

  uploadDocument = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = (req as AuthenticatedRequest).userId;
      const file = (req as AuthenticatedRequest).file;

      this._logger.info(`${LogEvents.TECH_DOC_UPLOAD_INIT}: ${technicianId}`);

      if (!technicianId)
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: ErrorMessages.UNAUTHORIZED });
      if (!file)
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ error: ErrorMessages.NO_FILE });

      const url = await this._uploadFileUseCase.execute(technicianId, {
        fileBuffer: file.buffer,
        fileName: file.originalname,
        mimeType: file.mimetype,
        folder: "documents",
      });

      return res
        .status(StatusCodes.OK)
        .json({ message: SuccessMessages.TECH_DOC_UPLOADED, url: url });
    } catch (err) {
      return this.handleError(err, res);
    }
  };

  toggleOnlineStatus = async (
    req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const technicianId = (req as AuthenticatedRequest).userId;
      const { lat, lng } = req.body;

      this._logger.info(`${LogEvents.TECH_STATUS_TOGGLE_INIT}: ${technicianId} at ${lat},${lng}`);

      if (!technicianId)
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: ErrorMessages.UNAUTHORIZED });

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
      const technicianId = (req as AuthenticatedRequest).userId;
      this._logger.info(`${LogEvents.TECH_RESUBMISSION_INIT}: ${technicianId}`);

      if (!technicianId)
        return res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ error: ErrorMessages.UNAUTHORIZED });

      await this._resubmitProfileUseCase.execute(technicianId);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: SuccessMessages.TECH_PROFILE_SUBMITTED,
      });
    } catch (err) {
      return this.handleError(err, res);
    }
  };

  // ✅ ACTION: Service Request
  requestServiceAddition = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = (req as any).userId;
      const { serviceId, categoryId, proofUrl } = req.body;

      if (!serviceId || !categoryId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: ErrorMessages.MISSING_FIELDS });
      }

      await this._requestServiceAddUseCase.execute(technicianId, {
        serviceId,
        categoryId,
        proofUrl
      });

      return res.status(StatusCodes.OK).json({ 
        success: true, 
        message: SuccessMessages.TECH_REQUEST_SUBMITTED 
      });

    } catch (err) {
      return this.handleError(err, res);
    }
  };

  // ✅ ACTION: Zone Request
  requestZoneTransfer = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = (req as any).userId;
      const { currentZoneId, requestedZoneId } = req.body;

      if (!currentZoneId || !requestedZoneId) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: ErrorMessages.MISSING_FIELDS });
      }

      await this._requestZoneTransferUseCase.execute(technicianId, {
        currentZoneId,
        requestedZoneId
      });

      return res.status(StatusCodes.OK).json({ 
        success: true, 
        message: SuccessMessages.TECH_REQUEST_SUBMITTED 
      });

    } catch (err) {
      return this.handleError(err, res);
    }
  };

  // ✅ ACTION: Bank Request
  requestBankUpdate = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = (req as any).userId;
      const { accountHolderName, accountNumber, bankName, ifscCode, proofUrl, upiId } = req.body;

      if (!accountHolderName || !accountNumber || !bankName || !ifscCode || !proofUrl) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: ErrorMessages.MISSING_FIELDS });
      }

      await this._requestBankUpdateUseCase.execute(technicianId, {
        accountHolderName,
        accountNumber,
        bankName,
        ifscCode,
        proofUrl,
        upiId
      });

      return res.status(StatusCodes.OK).json({ 
        success: true, 
        message: "Bank update requested. Payouts are paused until verification." 
      });

    } catch (err) {
      return this.handleError(err, res);
    }
  };

  private handleError(err: unknown, res: Response): Response {
    const errorMessage = err instanceof Error ? err.message : String(err);
    this._logger.error(`${LogEvents.TECH_PROFILE_ERROR}: ${errorMessage}`);
    if (Object.values(ErrorMessages).includes(errorMessage as ErrorMessages)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: errorMessage });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
  }
}