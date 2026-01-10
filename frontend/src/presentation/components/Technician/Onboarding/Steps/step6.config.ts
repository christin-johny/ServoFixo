import { z } from "zod";

// --- TYPES ---
export interface BankDetailsFormData {
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
}

// --- ZOD SCHEMA ---
export const step6Schema = z.object({
  accountHolderName: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .regex(/^[a-zA-Z\s.]+$/, "Name should only contain letters and spaces"),
  
  accountNumber: z
    .string()
    .min(9, "Account number is too short (min 9 digits)")
    .max(18, "Account number is too long (max 18 digits)")
    .regex(/^\d+$/, "Account number must contain only digits"),
  
  confirmAccountNumber: z
    .string(),

  ifscCode: z
    .string()
    .length(11, "IFSC Code must be exactly 11 characters")
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC format (e.g., SBIN0001234)"),

  bankName: z
    .string()
    .min(1, "Please enter a valid IFSC code to verify the bank"),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
  message: "Account numbers do not match",
  path: ["confirmAccountNumber"],
});