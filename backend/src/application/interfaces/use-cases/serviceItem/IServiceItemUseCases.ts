import { CreateServiceItemDto } from "../../../dto/serviceItem/CreateServiceItemDto"; 
import { EditServiceRequest, PaginatedServiceResponse, ServiceItemResponseDto } from "../../../dto/serviceItem/ServiceItemResponseDto";
import { ServiceItemQueryParams, ServiceFilters } from "../../../../domain/repositories/IServiceItemRepository";
import { Review } from "../../../../domain/entities/Review";
import { IFile } from "../../../dto/file/FileDto";

export interface ICreateServiceItemUseCase { 
  execute(dto: CreateServiceItemDto, imageFiles: IFile[]): Promise<ServiceItemResponseDto>;
}

export interface IEditServiceItemUseCase { 
  execute(request: EditServiceRequest): Promise<ServiceItemResponseDto>;
}

export interface IDeleteServiceItemUseCase { 
  execute(id: string): Promise<void>;
}

export interface IGetAllServiceItemsUseCase { 
  execute(params: ServiceItemQueryParams): Promise<PaginatedServiceResponse>;
}

export interface IGetServiceByIdUseCase { 
  execute(id: string): Promise<ServiceItemResponseDto | null>;
}

export interface IGetServiceListingUseCase { 
  execute(filters: ServiceFilters): Promise<ServiceItemResponseDto[]>;
}

export interface IGetMostBookedServicesUseCase { 
  execute(limit?: number): Promise<ServiceItemResponseDto[]>;
}

export interface IGetServiceReviewsUseCase { 
  execute(serviceId: string, limit?: number): Promise<Review[]>;
}

export interface IToggleServiceItemStatusUseCase { 
  execute(id: string, isActive: boolean): Promise<void>;
}