import { TechnicianResponseDto } from "../../../dto/technician/TechnicianResponseDto";
import { AdminTechnicianProfileDto } from "../../../dto/technician/TechnicianVerificationDtos";
import { TechnicianOnboardingInput } from "../../../dto/technician/TechnicianOnboardingDtos";
import { RateCardItem, RequestBankUpdateInput, RequestServiceAddInput, RequestZoneTransferInput, ToggleStatusInput, UploadTechnicianFileInput } from "../../../dto/technician/TechnicianProfileDto";
 

 

export interface ITechnicianOnboardingUseCase { 
  execute(input: TechnicianOnboardingInput): Promise<boolean>;
}

export interface IGetTechnicianProfileUseCase { 
  execute(technicianId: string): Promise<TechnicianResponseDto | null>;
}

export interface IGetTechnicianFullProfileUseCase { 
  execute(technicianId: string): Promise<AdminTechnicianProfileDto>;
}

export interface IGetTechnicianRateCardUseCase { 
  execute(technicianId: string): Promise<RateCardItem[]>;
}

export interface IToggleOnlineStatusUseCase { 
  execute(input: ToggleStatusInput): Promise<boolean>;
}

export interface IUploadTechnicianFileUseCase { 
  execute(technicianId: string, input: UploadTechnicianFileInput): Promise<string>;
}

export interface IResubmitProfileUseCase { 
  execute(technicianId: string): Promise<void>;
}

 

export interface IRequestBankUpdateUseCase { 
  execute(technicianId: string, input: RequestBankUpdateInput): Promise<void>;
}

export interface IRequestServiceAddUseCase { 
  execute(technicianId: string, input: RequestServiceAddInput): Promise<void>;
}

export interface IRequestZoneTransferUseCase { 
  execute(technicianId: string, input: RequestZoneTransferInput): Promise<void>;
}