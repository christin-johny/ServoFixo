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
  //   Added for robust linking
  _sourceCategoryId?: string; 
}

// --- ZOD SCHEMA ---
export const step2Schema = z.object({
  categoryIds: z.array(z.string()).min(1, "Please select at least one trade category."),
  subServiceIds: z.array(z.string()).min(1, "Please select at least one specific service.")
});

export type Step2FormData = z.infer<typeof step2Schema>;

// --- HELPERS ---

export const getId = (item: BaseItem | string | undefined): string => {
  if (!item) return "";
  if (typeof item === 'string') return item;
  return item.id || item._id || "";
};

// Robustly finds the Category ID for a service
export const getServiceCategoryId = (service: RuntimeServiceOption): string => {
  if (!service) return "";
  
  // 1. Priority: Manual tag injected during fetch (100% reliable)
  if (service._sourceCategoryId) return service._sourceCategoryId;
  
  // 2. Fallback: Standard fields
  if (service.categoryId) return getId(service.categoryId);
  if (service.category) return getId(service.category);
  
  return "";
};