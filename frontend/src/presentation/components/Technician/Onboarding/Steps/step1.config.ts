import { z } from "zod";

// --- Constants ---
export const EXPERIENCE_OPTIONS = [
  "Fresher (0-1 Years)",
  "1-3 Years",
  "3-5 Years",
  "5-10 Years",
  "10+ Years Expert",
] as const;

// --- Schema ---
export const step1Schema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters long")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  
  bio: z
    .string()
    .trim()
    .min(20, "Bio must be at least 20 characters long")
    .refine((val) => /[a-zA-Z]/.test(val), {
      message: "Bio must contain actual text (not just numbers or symbols)",
    }),

  experienceSummary: z.string().min(1, "Please select your years of experience"),
  
  avatarUrl: z.string().min(1, "Profile picture is mandatory"),
});

// --- Types ---
export type Step1FormData = z.infer<typeof step1Schema>;

// --- Initial State Helper (Optional) ---
// Useful to keep default empty state consistent
export const INITIAL_STEP1_STATE: Partial<Step1FormData> = {
  name: "",
  bio: "",
  experienceSummary: "",
  avatarUrl: "",
};