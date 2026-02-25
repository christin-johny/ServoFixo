import { CreateAddressDto } from "../../../dto/address/CreateAddressDto";
import { UpdateAddressDto } from "../../../dto/address/UpdateAddressDto";
import { AddressResponseDto } from "../../../dto/address/AddressResponseDto";


export interface IAddAddressUseCase {
  execute(input: CreateAddressDto, userId: string): Promise<AddressResponseDto>;
}

export interface IUpdateAddressUseCase {
  execute(id: string, userId: string, input: UpdateAddressDto): Promise<AddressResponseDto>;
}

export interface IGetAddressesUseCase {
  execute(userId: string): Promise<AddressResponseDto[]>;
}

export interface IDeleteAddressUseCase {
  execute(addressId: string, userId: string): Promise<boolean>;
}