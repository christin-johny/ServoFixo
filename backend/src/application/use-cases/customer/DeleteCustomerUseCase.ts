import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";

export class DeleteCustomerUseCase {
    constructor(private customerRepository: ICustomerRepository) {}
    async execute(customerId: string): Promise<void> {
        await this.customerRepository.delete(customerId);
    }
}