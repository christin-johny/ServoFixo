import { ICustomerRepository } from "../../../domain/repositories/ICustomerRepository";
import { IDeleteCustomerUseCase } from "../../interfaces/use-cases/customer/ICustomerUseCases";


export class DeleteCustomerUseCase  implements IDeleteCustomerUseCase{
    constructor(
        private _customerRepository: ICustomerRepository,
    ) {}
    
    async execute(customerId: string): Promise<void> {
        await this._customerRepository.delete(customerId);
    }
}