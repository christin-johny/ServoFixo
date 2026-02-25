import { IFile } from "../file/FileDto";
import { ServiceSpecificationDto } from "./ServiceSpecificationDto";
import { UpdateServiceItemDto } from "./UpdateServiceItemDto";

export class ServiceItemResponseDto {
  id!: string;
  categoryId!: string;
  name!: string;
  description!: string;
  basePrice!: number;
  specifications!: ServiceSpecificationDto[];
  imageUrls!: string[];
  isActive!: boolean;
  bookingCount!:number;
  rating!: number;
  reviewCount!: number;
  createdAt!: Date;
}

export interface PaginatedServiceResponse {
    data: ServiceItemResponseDto[];
    total: number;
    currentPage: number;
    totalPages: number;
}

export interface EditServiceRequest {
  id: string;
  dto: UpdateServiceItemDto;
  newImageFiles: IFile[];
  imagesToDelete?: string[];
}