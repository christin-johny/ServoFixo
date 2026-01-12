import { RequestAction, PartnerRequestType } from "../../../../../shared/types/enums/RequestResolutionEnums";

export interface ResolvePartnerRequestDto {
  requestType: PartnerRequestType;
  requestId: string; // The ID of the specific request within the array
  action: RequestAction;
  rejectionReason?: string;
}