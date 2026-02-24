import { NextFunction, Request, Response } from "express";
import { BaseController } from "../BaseController";
import { IUseCase } from "../../../application/interfaces/services/IUseCase";
import { ILogger } from "../../../application/interfaces/services/ILogger";
import { LogEvents } from "../../../infrastructure/logging/LogEvents";
import { SuccessMessages, ErrorMessages } from "../../../application/constants/ErrorMessages";
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
import { StatusCodes } from "../../utils/StatusCodes";

interface AuthenticatedRequest extends Request {
  userId?: string;
  file?: Express.Multer.File;
}

export class TechnicianProfileController extends BaseController {
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
    _logger: ILogger 
  ) {
    super(_logger);
  }

  private getTechId(req: Request): string {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) throw new Error(ErrorMessages.UNAUTHORIZED);
    return userId;
  }

  getOnboardingStatus = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = this.getTechId(req);
      const profileDto = await this._getProfileUseCase.execute(technicianId);
      if (!profileDto) throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);
 
      return res.status(StatusCodes.OK).json(profileDto);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.TECH_PROFILE_ERROR;
      next(err);
    }
  };

  uploadAvatar = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = this.getTechId(req);
      const file = (req as AuthenticatedRequest).file;
      if (!file) throw new Error(ErrorMessages.NO_FILE);

      const url = await this._uploadFileUseCase.execute(technicianId, {
        fileBuffer: file.buffer,
        fileName: file.originalname,
        mimeType: file.mimetype,
        folder: "avatars",
      });

      return res.status(StatusCodes.OK).json({ url });
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.AVATAR_UPLOAD_INIT;
      next(err);
    }
  };

  toggleOnlineStatus = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = this.getTechId(req);
      const { lat, lng } = req.body;

      const isOnline = await this._toggleStatusUseCase.execute({
        technicianId,
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
      });

      return res.status(StatusCodes.OK).json({ isOnline });
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.TECH_STATUS_TOGGLE_INIT;
      next(err);
    }
  };

  updatePersonalDetails = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = this.getTechId(req);
      const input: OnboardingStep1Dto = { ...req.body, step: 1, technicianId };
      await this._onboardingUseCase.execute(input);
      return this.ok(res, { nextStep: 2 }, SuccessMessages.TECH_STEP_SAVED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.TECH_UPDATE_DETAILS_INIT;
      next(err);
    }
  };

  updateWorkPreferences = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = this.getTechId(req);
      const input: OnboardingStep2Dto = { ...req.body, step: 2, technicianId };
      await this._onboardingUseCase.execute(input);
      return this.ok(res, { nextStep: 3 }, SuccessMessages.TECH_STEP_SAVED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.TECH_UPDATE_DETAILS_INIT;
      next(err);
    }
  };

  updateZones = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = this.getTechId(req);
      const input: OnboardingStep3Dto = { ...req.body, step: 3, technicianId };
      await this._onboardingUseCase.execute(input);
      return this.ok(res, { nextStep: 4 }, SuccessMessages.TECH_STEP_SAVED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.TECH_UPDATE_DETAILS_INIT;
      next(err);
    }
  };

  updateRateAgreement = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = this.getTechId(req);
      const input: OnboardingStep4Dto = { ...req.body, step: 4, technicianId };
      await this._onboardingUseCase.execute(input);
      return this.ok(res, { nextStep: 5 }, SuccessMessages.TECH_STEP_SAVED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.TECH_UPDATE_DETAILS_INIT;
      next(err);
    }
  };

  updateDocuments = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = this.getTechId(req);
      const input: OnboardingStep5Dto = { ...req.body, step: 5, technicianId };
      await this._onboardingUseCase.execute(input);
      return this.ok(res, { nextStep: 6 }, SuccessMessages.TECH_DOC_UPLOADED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.TECH_UPDATE_DETAILS_INIT;
      next(err);
    }
  };

  updateBankDetails = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = this.getTechId(req);
      const input: OnboardingStep6Dto = { ...req.body, step: 6, technicianId };
      await this._onboardingUseCase.execute(input);
      return this.ok(res, null, SuccessMessages.TECH_PROFILE_SUBMITTED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.TECH_UPDATE_DETAILS_INIT;
      next(err);
    }
  };

  uploadDocument = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = this.getTechId(req);
      const file = (req as AuthenticatedRequest).file;
      if (!file) throw new Error(ErrorMessages.NO_FILE);

      const url = await this._uploadFileUseCase.execute(technicianId, {
        fileBuffer: file.buffer,
        fileName: file.originalname,
        mimeType: file.mimetype,
        folder: "documents",
      });

      return this.ok(res, { url }, SuccessMessages.TECH_DOC_UPLOADED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.TECH_DOC_UPLOAD_INIT;
      next(err);
    }
  };

  dismissNotification = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = this.getTechId(req);
      const { requestId } = req.params;
      await this._dismissRequestUseCase.execute(technicianId, requestId);
      return this.ok(res, null, SuccessMessages.TECH_REQUEST_DISMISSED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.TECH_DISMISS_REQUEST_INIT;
      next(err);
    }
  };

  resubmitProfile = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = this.getTechId(req);
      await this._resubmitProfileUseCase.execute(technicianId);
      return this.ok(res, null, SuccessMessages.TECH_PROFILE_SUBMITTED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.TECH_RESUBMISSION_INIT;
      next(err);
    }
  };

  requestServiceAddition = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = this.getTechId(req);
      const { serviceId, categoryId, proofUrl, action } = req.body;
      if (!serviceId || !categoryId || !action) {
        throw new Error(ErrorMessages.MISSING_REQUIRED_FIELDS);
      }

      await this._requestServiceAddUseCase.execute(technicianId, {
        serviceId,
        categoryId,
        proofUrl,
        action  
      });

      return this.ok(res, null, SuccessMessages.TECH_REQUEST_SUBMITTED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.TECH_PROFILE_ERROR;
      next(err);
    }
  };

  requestZoneTransfer = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = this.getTechId(req);
      const { currentZoneId, requestedZoneId } = req.body;
      if (!currentZoneId || !requestedZoneId) {
        throw new Error(ErrorMessages.MISSING_REQUIRED_FIELDS);
      }

      await this._requestZoneTransferUseCase.execute(technicianId, {
        currentZoneId,
        requestedZoneId
      });

      return this.ok(res, null, SuccessMessages.TECH_REQUEST_SUBMITTED);
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.TECH_PROFILE_ERROR;
      next(err);
    }
  };

  requestBankUpdate = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const technicianId = this.getTechId(req);
      const { accountHolderName, accountNumber, bankName, ifscCode, proofUrl, upiId } = req.body;
      console.log(proofUrl)
      if (!accountHolderName || !accountNumber || !bankName || !ifscCode || !proofUrl) {
        throw new Error(ErrorMessages.MISSING_REQUIRED_FIELDS);
      }

      await this._requestBankUpdateUseCase.execute(technicianId, {
        accountHolderName,
        accountNumber,
        bankName,
        ifscCode,
        proofUrl,
        upiId
      });

      return this.ok(res, null, "Bank update requested. Payouts are paused until verification.");
    } catch (err) {
      (err as Error & { logContext?: string }).logContext = LogEvents.TECH_PROFILE_ERROR;
      next(err);
    }
  };
}