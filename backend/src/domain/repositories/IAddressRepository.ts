import { Address } from "../entities/Address";

export interface IAddressRepository {
  create(address: Address): Promise<Address>;
  update(address: Address): Promise<Address>;
  delete(id: string): Promise<boolean>;
  findById(id: string): Promise<Address | null>;
  findDefaultByUserId(userId: string): Promise<Address | null>;
  checkServiceability(id: string): Promise<boolean>;
  findAllByUserId(userId: string): Promise<Address[] | null>
}