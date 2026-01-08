import { z } from "zod";

// --- TYPES ---
export interface BaseItem {
  id?: string;
  _id?: string;
  name: string;
}

export interface RuntimeCategoryOption extends BaseItem {
  imageUrl?: string;
  iconUrl?: string;
}

export interface RuntimeServiceOption extends BaseItem {
  categoryId?: string | BaseItem; 
  category?: string | BaseItem;
  description?: string;
  price?: number;
}

// --- ZOD SCHEMA ---
export const step2Schema = z.object({
  categoryIds: z.array(z.string()).min(1, "Please select at least one trade category."),
  subServiceIds: z.array(z.string()).min(1, "Please select at least one specific service.")
});

export type Step2FormData = z.infer<typeof step2Schema>;
 
export const getId = (item: BaseItem | string | undefined): string => {
  if (!item) return "";
  if (typeof item === 'string') return item;
  return item.id || item._id || "";
};