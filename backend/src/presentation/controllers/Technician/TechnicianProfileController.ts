import { Request, Response } from "express";
import { BaseController } from "../BaseController";
import { IUseCase } from "../../../application/interfaces/IUseCase";
import { ILogger } from "../../../application/interfaces/ILogger";
import { LogEvents } from "../../../../../shared/constants/LogEvents";
import { SuccessMessages, ErrorMessages } from "../../../../../shared/types/enums/ErrorMessages";
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
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";

// Using your existing interface to prevent breaking changes
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
    _logger: ILogger // Passed to BaseController
  ) {
    super(_logger);
  }

  /**
   * Safe helper to extract technicianId with validation
   */
  private getTechId(req: Request): string {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) throw new Error(ErrorMessages.UNAUTHORIZED);
    return userId;
  }

getOnboardingStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = this.getTechId(req);
      const profileDto = await this._getProfileUseCase.execute(technicianId);
      if (!profileDto) throw new Error(ErrorMessages.TECHNICIAN_NOT_FOUND);
 
      return res.status(StatusCodes.OK).json(profileDto);
    } catch (err) {
      return this.handleError(res, err, LogEvents.TECH_PROFILE_ERROR);
    }
  };

  uploadAvatar = async (req: Request, res: Response): Promise<Response> => {
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

      //  FIX: Frontend expects { url: "..." }
      return res.status(StatusCodes.OK).json({ url });
    } catch (err) {
      return this.handleError(res, err, LogEvents.AVATAR_UPLOAD_INIT);
    }
  };

  toggleOnlineStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = this.getTechId(req);
      const { lat, lng } = req.body;

      const isOnline = await this._toggleStatusUseCase.execute({
        technicianId,
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
      });

      //  FIX: Match repository expectations
      return res.status(StatusCodes.OK).json({ isOnline });
    } catch (err) {
      return this.handleError(res, err, LogEvents.TECH_STATUS_TOGGLE_INIT);
    }
  };

  updatePersonalDetails = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = this.getTechId(req);
      const input: OnboardingStep1Dto = { ...req.body, step: 1, technicianId };
      await this._onboardingUseCase.execute(input);
      return this.ok(res, { nextStep: 2 }, SuccessMessages.TECH_STEP_SAVED);
    } catch (err) {
      return this.handleError(res, err, LogEvents.TECH_UPDATE_DETAILS_INIT);
    }
  };

  updateWorkPreferences = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = this.getTechId(req);
      const input: OnboardingStep2Dto = { ...req.body, step: 2, technicianId };
      await this._onboardingUseCase.execute(input);
      return this.ok(res, { nextStep: 3 }, SuccessMessages.TECH_STEP_SAVED);
    } catch (err) {
      return this.handleError(res, err, LogEvents.TECH_UPDATE_DETAILS_INIT);
    }
  };

  updateZones = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = this.getTechId(req);
      const input: OnboardingStep3Dto = { ...req.body, step: 3, technicianId };
      await this._onboardingUseCase.execute(input);
      return this.ok(res, { nextStep: 4 }, SuccessMessages.TECH_STEP_SAVED);
    } catch (err) {
      return this.handleError(res, err, LogEvents.TECH_UPDATE_DETAILS_INIT);
    }
  };

  updateRateAgreement = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = this.getTechId(req);
      const input: OnboardingStep4Dto = { ...req.body, step: 4, technicianId };
      await this._onboardingUseCase.execute(input);
      return this.ok(res, { nextStep: 5 }, SuccessMessages.TECH_STEP_SAVED);
    } catch (err) {
      return this.handleError(res, err, LogEvents.TECH_UPDATE_DETAILS_INIT);
    }
  };

  updateDocuments = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = this.getTechId(req);
      const input: OnboardingStep5Dto = { ...req.body, step: 5, technicianId };
      await this._onboardingUseCase.execute(input);
      return this.ok(res, { nextStep: 6 }, SuccessMessages.TECH_DOC_UPLOADED);
    } catch (err) {
      return this.handleError(res, err, LogEvents.TECH_UPDATE_DETAILS_INIT);
    }
  };

  updateBankDetails = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = this.getTechId(req);
      const input: OnboardingStep6Dto = { ...req.body, step: 6, technicianId };
      await this._onboardingUseCase.execute(input);
      return this.ok(res, null, SuccessMessages.TECH_PROFILE_SUBMITTED);
    } catch (err) {
      return this.handleError(res, err, LogEvents.TECH_UPDATE_DETAILS_INIT);
    }
  };


  uploadDocument = async (req: Request, res: Response): Promise<Response> => {
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
      return this.handleError(res, err, LogEvents.TECH_DOC_UPLOAD_INIT);
    }
  };

  dismissNotification = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = this.getTechId(req);
      const { requestId } = req.params;
      await this._dismissRequestUseCase.execute(technicianId, requestId);
      return this.ok(res, null, SuccessMessages.TECH_REQUEST_DISMISSED);
    } catch (err) {
      return this.handleError(res, err, LogEvents.TECH_DISMISS_REQUEST_INIT);
    }
  };



  resubmitProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = this.getTechId(req);
      await this._resubmitProfileUseCase.execute(technicianId);
      return this.ok(res, null, SuccessMessages.TECH_PROFILE_SUBMITTED);
    } catch (err) {
      return this.handleError(res, err, LogEvents.TECH_RESUBMISSION_INIT);
    }
  };

  requestServiceAddition = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = this.getTechId(req);
      const { serviceId, categoryId, proofUrl, action } = req.body;
      if (!serviceId || !categoryId || !action) {
        throw new Error(ErrorMessages.MISSING_FIELDS);
      }

      await this._requestServiceAddUseCase.execute(technicianId, {
        serviceId,
        categoryId,
        proofUrl,
        action  
      });

      return this.ok(res, null, SuccessMessages.TECH_REQUEST_SUBMITTED);
    } catch (err) {
      return this.handleError(res, err, LogEvents.TECH_PROFILE_ERROR);
    }
  };

  requestZoneTransfer = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = this.getTechId(req);
      const { currentZoneId, requestedZoneId } = req.body;
      if (!currentZoneId || !requestedZoneId) {
        throw new Error(ErrorMessages.MISSING_FIELDS);
      }

      await this._requestZoneTransferUseCase.execute(technicianId, {
        currentZoneId,
        requestedZoneId
      });

      return this.ok(res, null, SuccessMessages.TECH_REQUEST_SUBMITTED);
    } catch (err) {
      return this.handleError(res, err, LogEvents.TECH_PROFILE_ERROR);
    }
  };

  requestBankUpdate = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = this.getTechId(req);
      const { accountHolderName, accountNumber, bankName, ifscCode, proofUrl, upiId } = req.body;
      if (!accountHolderName || !accountNumber || !bankName || !ifscCode || !proofUrl) {
        throw new Error(ErrorMessages.MISSING_FIELDS);
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
      return this.handleError(res, err, LogEvents.TECH_PROFILE_ERROR);
    }
  };
}