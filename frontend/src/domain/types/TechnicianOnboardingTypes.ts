export interface OnboardingStatusResponse {
  onboardingStep: number;
  verificationStatus: string;
  personalDetails: {
    name: string;
    email: string;
    phone: string;
    avatarUrl?: string;
    bio?: string;
    experienceSummary?: string;
  };
}

export interface Step1Data {
  bio: string;
  experienceSummary: string;
  avatarUrl?: string;
  // Read-only for display
  name?: string;
  email?: string;
  phone?: string;
}

export const EXPERIENCE_OPTIONS = [
  { value: "Fresher", label: "Fresher (No Experience)" },
  { value: "0-1 Years", label: "Less than 1 Year" },
  { value: "1-3 Years", label: "1 to 3 Years" },
  { value: "3-5 Years", label: "3 to 5 Years" },
  { value: "5+ Years", label: "More than 5 Years" },
  { value: "10+ Years", label: "Expert (10+ Years)" },
];