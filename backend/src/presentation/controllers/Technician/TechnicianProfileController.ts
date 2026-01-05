import { Request, Response } from "express";
import { StatusCodes } from "../../../../../shared/types/enums/StatusCodes";
import { ErrorMessages, SuccessMessages } from "../../../../../shared/types/enums/ErrorMessages";
import { IUseCase } from "../../../application/interfaces/IUseCase";
import { ILogger } from "../../../application/interfaces/ILogger";
import { Technician } from "../../../domain/entities/Technician";
import { UploadTechnicianFileUseCase } from "../../../application/use-cases/technician/profile/UploadTechnicianFileUseCase"; //
import { LogEvents } from "../../../../../shared/constants/LogEvents";

// Import Strict DTOs
import { 
  TechnicianOnboardingInput,
  OnboardingStep1Dto,
  OnboardingStep2Dto,
  OnboardingStep3Dto,
  OnboardingStep4Dto,
  OnboardingStep5Dto,
  OnboardingStep6Dto
} from "../../../application/dto/technician/TechnicianOnboardingDtos";

export class TechnicianProfileController {
  constructor(
    private readonly _onboardingUseCase: IUseCase<boolean, [TechnicianOnboardingInput]>,
    private readonly _getProfileUseCase: IUseCase<Technician | null, [string]>, 
    private readonly _uploadFileUseCase: UploadTechnicianFileUseCase,
    private readonly _logger: ILogger
  ) {}

  // ==========================================
  // READ OPERATION
  // ==========================================
getOnboardingStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = (req as any).userId as string;
      if (!technicianId) return res.status(StatusCodes.UNAUTHORIZED).json({ error: ErrorMessages.UNAUTHORIZED });

      const technician = await this._getProfileUseCase.execute(technicianId);
      if (!technician) return res.status(StatusCodes.NOT_FOUND).json({ error: ErrorMessages.TECHNICIAN_NOT_FOUND });

      return res.status(StatusCodes.OK).json({
        id: technician.getId(),
        
        // Status Flags
        onboardingStep: technician.getOnboardingStep(),
        verificationStatus: technician.getVerificationStatus(),
        availability: { isOnline: technician.getIsOnline() },
        
        // Step 1: Personal
        personalDetails: {
           name: technician.getName(),
           email: technician.getEmail(),
           phone: technician.getPhone(),
           avatarUrl: technician.getAvatarUrl(),
           bio: technician.getBio(),
           experienceSummary: technician.getExperienceSummary()
        },

        // Step 2: Work Preferences
        categoryIds: technician.getCategoryIds(),
        subServiceIds: technician.getSubServiceIds(),

        // Step 3: Zones
        zoneIds: technician.getZoneIds(),

        // Step 5: Documents (Filtered for frontend safety if needed)
        documents: technician.getDocuments().map(doc => ({
            type: doc.type,
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            status: doc.status,
            rejectionReason: doc.rejectionReason
        })),

        // Step 6: Bank Details
        bankDetails: technician.getBankDetails() || null
      });
    } catch (err) {
      return this.handleError(err, res);
    }
  };

  // ==========================================
  // WRITE OPERATIONS (Step 1 - 6)
  // ==========================================

  // STEP 1: Personal Details
  updatePersonalDetails = async (req: Request, res: Response): Promise<Response> => {
    try {
      const input: OnboardingStep1Dto = {
        ...req.body,
        step: 1,
        technicianId: (req as any).userId
      };
      await this._onboardingUseCase.execute(input);
      return res.status(StatusCodes.OK).json({ message: SuccessMessages.TECH_STEP_SAVED, nextStep: 2 });
    } catch (err) { return this.handleError(err, res); }
  };

  // STEP 2: Work Preferences
  updateWorkPreferences = async (req: Request, res: Response): Promise<Response> => {
    try {
      const input: OnboardingStep2Dto = {
        ...req.body, // Expects categoryIds, subServiceIds
        step: 2,
        technicianId: (req as any).userId
      };
      await this._onboardingUseCase.execute(input);
      return res.status(StatusCodes.OK).json({ message: SuccessMessages.TECH_STEP_SAVED, nextStep: 3 });
    } catch (err) { return this.handleError(err, res); }
  };

  // STEP 3: Zones
  updateZones = async (req: Request, res: Response): Promise<Response> => {
    try {
      const input: OnboardingStep3Dto = {
        ...req.body, // Expects zoneIds
        step: 3,
        technicianId: (req as any).userId
      };
      await this._onboardingUseCase.execute(input);
      return res.status(StatusCodes.OK).json({ message: SuccessMessages.TECH_STEP_SAVED, nextStep: 4 });
    } catch (err) { return this.handleError(err, res); }
  };

  // STEP 4: Rate Agreement
  updateRateAgreement = async (req: Request, res: Response): Promise<Response> => {
    try {
      const input: OnboardingStep4Dto = {
        ...req.body, // Expects agreedToRates: boolean
        step: 4,
        technicianId: (req as any).userId
      };
      await this._onboardingUseCase.execute(input);
      return res.status(StatusCodes.OK).json({ message: SuccessMessages.TECH_STEP_SAVED, nextStep: 5 });
    } catch (err) { return this.handleError(err, res); }
  };

  // STEP 5: Documents (Metadata Save)
  // Note: Actual file upload happens via separate /upload endpoint returning URL
  updateDocuments = async (req: Request, res: Response): Promise<Response> => {
    try {
      const input: OnboardingStep5Dto = {
        ...req.body, // Expects documents: TechnicianDocumentDto[]
        step: 5,
        technicianId: (req as any).userId
      };
      await this._onboardingUseCase.execute(input);
      return res.status(StatusCodes.OK).json({ message: SuccessMessages.TECH_DOC_UPLOADED, nextStep: 6 });
    } catch (err) { return this.handleError(err, res); }
  };

  // STEP 6: Bank Details & Submit
  updateBankDetails = async (req: Request, res: Response): Promise<Response> => {
    try {
      const input: OnboardingStep6Dto = {
        ...req.body, // Expects bankDetails object
        step: 6,
        technicianId: (req as any).userId
      };
      await this._onboardingUseCase.execute(input);
      return res.status(StatusCodes.OK).json({ message: SuccessMessages.TECH_PROFILE_SUBMITTED });
    } catch (err) { return this.handleError(err, res); }
  };

  // ==========================================
  // HELPERS
  // ==========================================
  private handleError(err: unknown, res: Response): Response {
    const errorMessage = err instanceof Error ? err.message : String(err);
    this._logger.error(LogEvents.TECH_PROFILE_ERROR, errorMessage);
    
    // Map known domain errors to 400 Bad Request
    if (Object.values(ErrorMessages).includes(errorMessage as ErrorMessages)) {
       return res.status(StatusCodes.BAD_REQUEST).json({ error: errorMessage });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: ErrorMessages.INTERNAL_ERROR });
  }
  uploadAvatar = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = (req as any).userId;
      if (!req.file) return res.status(StatusCodes.BAD_REQUEST).json({ error: ErrorMessages.NO_FILE });

      const url = await this._uploadFileUseCase.execute(technicianId, {
        fileBuffer: req.file.buffer,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        folder: "avatars"
      });

      return res.status(StatusCodes.OK).json({ 
        message: SuccessMessages.TECH_DOC_UPLOADED,
        url: url 
      });
    } catch (err) { return this.handleError(err, res); }
  };

  // POST /technician/onboarding/upload/document
  uploadDocument = async (req: Request, res: Response): Promise<Response> => {
    try {
      const technicianId = (req as any).userId;
      if (!req.file) return res.status(StatusCodes.BAD_REQUEST).json({ error: ErrorMessages.NO_FILE });

      const url = await this._uploadFileUseCase.execute(technicianId, {
        fileBuffer: req.file.buffer,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        folder: "documents"
      });

      return res.status(StatusCodes.OK).json({ 
        message: SuccessMessages.TECH_DOC_UPLOADED,
        url: url 
      });
    } catch (err) { return this.handleError(err, res); }
  };
}