import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";

export class DeleteCustomerUseCase {
    constructor(private _customerRepository: ICustomerRepository) {}
    async execute(customerId: string): Promise<void> {
        await this._customerRepository.delete(customerId);
    }
}