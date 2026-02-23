 
const VERSION = "/v1";

export const TECHNICIAN_PROFILE_ENDPOINTS = { 
  GET_STATUS: `${VERSION}/technician/profile/onboarding/status`,
  STEP_1_PERSONAL: `${VERSION}/technician/profile/onboarding/step-1`,
  STEP_2_PREFERENCES: `${VERSION}/technician/profile/onboarding/step-2`,
  STEP_3_ZONES: `${VERSION}/technician/profile/onboarding/step-3`,
  STEP_4_RATES: `${VERSION}/technician/profile/onboarding/step-4`,
  STEP_5_DOCUMENTS: `${VERSION}/technician/profile/onboarding/step-5`,
  STEP_6_BANK: `${VERSION}/technician/profile/onboarding/step-6`,
   
  UPLOAD_AVATAR: `${VERSION}/technician/profile/onboarding/upload/avatar`,
  UPLOAD_DOCUMENT: `${VERSION}/technician/profile/onboarding/upload/document`,
   
  GET_CATEGORIES: `${VERSION}/technician/data/categories`,
  GET_SERVICES: `${VERSION}/technician/data/services`,
  GET_ZONES: `${VERSION}/technician/data/zones`,
  GET_RATE_CARD: `${VERSION}/technician/data/rate-card`,
};