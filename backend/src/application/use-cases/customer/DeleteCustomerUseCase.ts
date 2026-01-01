import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { ILogger } from "../../interfaces/ILogger"; 
import { LogEvents } from "../../../../../shared/constants/LogEvents";

export class DeleteCustomerUseCase {
    constructor(
        private _customerRepository: ICustomerRepository,
        private _logger: ILogger
    ) {}
    
    async execute(customerId: string): Promise<void> {
        this._logger.info(LogEvents.ACCOUNT_DELETE_INIT, { customerId });
        await this._customerRepository.delete(customerId);
        this._logger.info(LogEvents.ACCOUNT_DELETE_SUCCESS, { customerId });
    }
}