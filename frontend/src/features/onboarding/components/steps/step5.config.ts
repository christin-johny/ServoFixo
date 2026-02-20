import { z } from "zod";

// --- TYPES ---
export type DocType = "AADHAAR" | "PAN" | "PASSBOOK" | "CERTIFICATE" | "OTHER";

export interface UploadedDoc {
  id: string;
  type: DocType;
  customName?: string;
  url: string;
  file?: File;
  // APPROVED status here triggers the locking in DocUploadCard
  status: "PENDING" | "APPROVED" | "REJECTED"; 
  rejectionReason?: string;
}

// --- CONSTANTS ---
export const MANDATORY_SLOTS: { type: DocType; label: string; isOptional?: boolean }[] = [
  { type: "AADHAAR", label: "Aadhaar Card" },
  { type: "PAN", label: "PAN Card" },
  //   Mandatory for Payout Verification
  { type: "PASSBOOK", label: "Bank Passbook / Cancelled Cheque" }, 
  { type: "CERTIFICATE", label: "Resume / Skill Certificate" }, 
];

// --- ZOD SCHEMA ---
export const step5Schema = z.object({
  documents: z.array(z.any()).superRefine((docs, ctx) => {
    MANDATORY_SLOTS.filter(s => !s.isOptional).forEach(slot => {
      // Check if a document of this type exists
      const exists = docs.find(d => d.type === slot.type);
      if (!exists) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${slot.label} is required`,
        });
      }
    });
  })
});