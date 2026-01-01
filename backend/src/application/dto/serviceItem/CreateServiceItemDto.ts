import { ServiceSpecificationDto } from "./ServiceSpecificationDto";

export class CreateServiceItemDto {
  categoryId!: string;
  name!: string;
  description!: string;
  basePrice!: number;
  specifications!: ServiceSpecificationDto[];
  isActive!: boolean;
}