import { z } from "zod";

const nameRule = z
  .string()
  .min(3, "Name must be at least 3 characters")
  .max(50, "Name cannot exceed 50 characters")
  .trim()
  .regex(/^[a-zA-Z]/, "Name must start with a letter")
  .regex(/^[a-zA-Z0-9\s-/()]+$/, "Name contains invalid characters");

const descriptionRule = z
  .string()
  .min(10, "Description must be at least 10 characters")
  .max(1500, "Description cannot exceed 500 chars")
  .trim();

export const createCategorySchema = z.object({
  body: z.object({
    name: nameRule,
    description: descriptionRule,
    isActive: z
      .enum(["true", "false"], {
        invalid_type_error: "Status must be 'true' or 'false'",
        required_error: "Status is required",
      })
      .transform((val) => val === "true"),
  }),
});

export const createServiceItemSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1, "Category ID is required"),
    name: nameRule,
    description: descriptionRule,

    basePrice: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Price must be a valid positive number",
      })
      .transform((val) => Number(val)),

    specifications: z.string().transform((str, ctx) => {
      try {
        const parsed = JSON.parse(str);
        if (!Array.isArray(parsed)) throw new Error("Not an array");

        const isValid = parsed.every((item: any) => item.title && item.value);
        if (!isValid) throw new Error("Invalid specs");
        return parsed;
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Specifications must be valid JSON: [{title: 'Key', value: 'Value'}]",
        });
        return z.NEVER;
      }
    }),

    isActive: z
      .enum(["true", "false"], {
        invalid_type_error: "Status must be 'true' or 'false'",
      })
      .transform((val) => val === "true"),
  }),
});
