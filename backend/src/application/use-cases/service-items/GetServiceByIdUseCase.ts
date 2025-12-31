import { IServiceItemRepository } from '../../../domain/repositories/IServiceItemRepository';

export class GetServiceByIdUseCase{
  constructor(private readonly _serviceRepo: IServiceItemRepository) {}

  async execute(id:string): Promise<any> {
    return this._serviceRepo.findById(id);
  }
}