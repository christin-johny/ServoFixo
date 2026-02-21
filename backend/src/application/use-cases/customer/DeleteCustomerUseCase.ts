import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { ILogger } from "../../interfaces/ILogger"; 
import { LogEvents } from "../../../infrastructure/logging/LogEvents";

export class DeleteCustomerUseCase {
    constructor(
        private _customerRepository: ICustomerRepository,
        private _logger: ILogger
    ) {}
    
    async execute(customerId: string): Promise<void> {
        await this._customerRepository.delete(customerId);
    }
}