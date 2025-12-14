import { IServiceItemRepository } from '../../../domain/repositories/IServiceItemRepository';

export class GetServiceByIdUseCase{
  constructor(private readonly serviceRepo: IServiceItemRepository) {}

  async execute(id:string): Promise<any> {
    return this.serviceRepo.findById(id);
  }
}