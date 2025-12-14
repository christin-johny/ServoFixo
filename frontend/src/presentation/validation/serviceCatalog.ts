import { z } from "zod";

const nameRule = z
  .string()
  .min(3, "Name must be at least 3 characters")
  .max(50, "Name is too long")
  .regex(/^[a-zA-Z]/, "Name must start with a letter")
  .regex(
    /^[a-zA-Z0-9\s-/()]+$/,
    "Name can only contain letters, numbers, spaces, and hyphens"
  );

const descriptionRule = z
  .string()
  .min(10, "Description must be at least 10 characters")
  .max(1500, "Description is too long")
  .trim();

const priceRule = z
  .number({ invalid_type_error: "Price must be a valid number" })
  .min(1, "Price cannot be zero or negative");

export const categorySchema = z.object({
  name: nameRule,
  description: descriptionRule,
});

export const serviceItemSchema = z.object({
  name: nameRule,
  description: descriptionRule,
  basePrice: priceRule,
});
