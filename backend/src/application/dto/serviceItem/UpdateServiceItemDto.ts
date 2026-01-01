import { ServiceSpecificationDto } from "./ServiceSpecificationDto";

export class UpdateServiceItemDto {
  categoryId?: string;
  name?: string;
  description?: string;
  basePrice?: number;
  specifications?: ServiceSpecificationDto[];
  isActive?: boolean;
}