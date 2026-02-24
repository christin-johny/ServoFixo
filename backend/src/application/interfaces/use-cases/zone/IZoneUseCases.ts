import { CreateZoneDto } from "../../../dto/zone/CreateZoneDto";
import { UpdateZoneDto } from "../../../dto/zone/UpdateZoneDto";
import { PaginatedZonesResponse, ZoneResponseDto } from "../../../dto/zone/ZoneResponseDto";
import { ZoneServiceabilityDto } from "../../../dto/zone/ZoneServiceabilityDto";
import { ZoneQueryParams } from "../../../../domain/repositories/IZoneRepository";
 

export interface ICreateZoneUseCase { 
  execute(input: CreateZoneDto): Promise<ZoneResponseDto>;
}

export interface IEditZoneUseCase { 
  execute(id: string, input: UpdateZoneDto): Promise<ZoneResponseDto>;
}

export interface IDeleteZoneUseCase { 
  execute(id: string): Promise<boolean>;
}

export interface IGetAllZonesUseCase { 
  execute(params: ZoneQueryParams): Promise<PaginatedZonesResponse>;
}

export interface IFindZoneByLocationUseCase {
  execute(lat: number, lng: number): Promise<ZoneServiceabilityDto>;
}