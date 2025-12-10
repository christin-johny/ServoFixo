// src/presentation/validation/customerSchemas.ts

import { z } from 'zod';

const NAME_REGEX = /^[A-Za-z ]{2,50}$/;

const PHONE_REGEX = /^[6-9]\d{9}$/;

export const CustomerEditSchema = z.object({
  name: z.string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(50, { message: "Name must be at most 50 characters." })
    .regex(NAME_REGEX, { message: "Name can only contain alphabets and spaces." }),

  email: z.string()
    .trim()
    .email({ message: "Invalid email format." }),

  phone: z.string()
    .trim()
    .optional()
    .nullable()
    .refine(val => !val || PHONE_REGEX.test(val), {
      message: "Phone number must be a 10-digit Indian number starting with 6-9.",
    })
    .transform(val => (val === "" ? null : val)),

  suspended: z.boolean(),
});

export type CustomerEditForm = z.infer<typeof CustomerEditSchema>;