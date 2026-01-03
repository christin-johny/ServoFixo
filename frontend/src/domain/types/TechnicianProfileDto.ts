// Strict typing for the API Response
export interface TechnicianProfileStatusDto {
  id: string;
  onboardingStep: number;
  verificationStatus: "PENDING" | "VERIFICATION_PENDING" | "VERIFIED" | "REJECTED";
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