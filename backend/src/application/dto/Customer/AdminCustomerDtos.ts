import { z } from 'zod';


export const CustomerResponseSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  suspended: z.boolean(), 
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CustomerResponseDto = z.infer<typeof CustomerResponseSchema>;

export const CustomerFilterSchema = z.object({
  page: z.string().transform(val => parseInt(val) || 1).default('1'),
  limit: z.string().transform(val => parseInt(val) || 10).default('10'),
  search: z.string().optional(), 
  suspended: z.string().optional().transform(val => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }),
});

export type CustomerFilterDto = z.infer<typeof CustomerFilterSchema>;

export const CustomerUpdateSchema = z.object({
    name: z.string().min(1, "Name is required").max(100).trim(),
    email: z.string().email("Invalid email format").min(1).toLowerCase().trim(),
    phone: z.string().min(10, "Phone number must be at least 10 digits").max(15).optional(),
    suspended: z.boolean({ required_error: "Account status (suspended) is required" }),
});

export type CustomerUpdateDto = z.infer<typeof CustomerUpdateSchema>;