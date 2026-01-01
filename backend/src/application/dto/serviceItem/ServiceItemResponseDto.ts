import { ServiceSpecificationDto } from "./ServiceSpecificationDto";

export class ServiceItemResponseDto {
  id!: string;
  categoryId!: string;
  name!: string;
  description!: string;
  basePrice!: number;
  specifications!: ServiceSpecificationDto[];
  imageUrls!: string[];
  isActive!: boolean;
  rating!: number;
  reviewCount!: number;
  createdAt!: Date;
}