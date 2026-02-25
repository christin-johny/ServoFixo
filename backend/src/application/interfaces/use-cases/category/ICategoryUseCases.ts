import { CreateCategoryDto } from "../../../dto/category/CreateCategoryDto";
import { UpdateCategoryDto } from "../../../dto/category/UpdateCategoryDto";
import { CategoryResponseDto, PaginatedCategoriesResponse } from "../../../dto/category/CategoryResponseDto";
import { CategoryQueryParams } from "../../../../domain/repositories/IServiceCategoryRepository";
import { IFile } from "../../../dto/file/FileDto";


export interface ICreateCategoryUseCase {
 
  execute(dto: CreateCategoryDto, imageFile?: IFile): Promise<CategoryResponseDto>;
}

export interface IEditCategoryUseCase {
 
  execute(id: string, dto: UpdateCategoryDto, imageFile?: IFile): Promise<CategoryResponseDto>;
}

export interface IDeleteCategoryUseCase {
 
  execute(id: string): Promise<void>;
}

export interface IGetAllCategoriesUseCase {
 
  execute(params: CategoryQueryParams): Promise<PaginatedCategoriesResponse>;
}

export interface IToggleCategoryStatusUseCase {
 
  execute(id: string, isActive: boolean): Promise<void>;
}