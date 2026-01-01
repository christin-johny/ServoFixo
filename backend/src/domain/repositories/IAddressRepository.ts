import { Address } from "../entities/Address";
import { IBaseRepository } from "./IBaseRepository";

export interface IAddressRepository extends IBaseRepository<Address> {
  // create(address: Address): Promise<Address>;
  // update(address: Address): Promise<Address>;
  // delete(id: string): Promise<boolean>;
  // findById(id: string): Promise<Address | null>;
  findDefaultByUserId(userId: string): Promise<Address | null>;
  checkServiceability(id: string): Promise<boolean>;
  findAllByUserId(userId: string): Promise<Address[] | null>;
}
