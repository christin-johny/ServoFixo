import { z } from 'zod';

// --- 1. Customer Response DTO (Output Contract) ---
// This defines the structure returned by the API (hides password, etc.)

export const CustomerResponseSchema = z.object({
  id: z.string().optional(), // Mongoose _id
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  // Note: We use 'suspended' from the model, but think of it as !isActive
  suspended: z.boolean(), 
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CustomerResponseDto = z.infer<typeof CustomerResponseSchema>;


// --- 2. Customer List Filter DTO (Input Query Contract) ---
// Used to validate and type the incoming URL query parameters for the list endpoint.

export const CustomerFilterSchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).default('1'),
  limit: z.string().transform(val => parseInt(val) || 10).default('10'),
  search: z.string().optional(), // Search by name, email, or phone
  // The 'suspended' filter will be passed as a string ('true' or 'false') in the URL
  suspended: z.string().optional().transform(val => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }),
});

export type CustomerFilterDto = z.infer<typeof CustomerFilterSchema>;


// --- 3. Customer Update DTO (Input Body Contract) ---
// Used to validate and type the incoming request body for profile updates.

export const CustomerUpdateSchema = z.object({
    name: z.string().min(1, "Name is required").max(100).trim(),
    email: z.string().email("Invalid email format").min(1).toLowerCase().trim(),
    phone: z.string().min(10, "Phone number must be at least 10 digits").max(15).optional(),
    // We expect the admin toggle to send this status
    suspended: z.boolean({ required_error: "Account status (suspended) is required" }),
    // Additional fields like defaultZoneId, addresses if needed for admin updates
});

export type CustomerUpdateDto = z.infer<typeof CustomerUpdateSchema>;