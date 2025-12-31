import { IServiceItemRepository } from '../../../domain/repositories/IServiceItemRepository';


export class DeleteServiceItemUseCase {
  constructor(
    private readonly _serviceRepo: IServiceItemRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const service = await this._serviceRepo.findById(id);
    if (!service) throw new Error('Service Item not found');

    await this._serviceRepo.delete(id);
  }
}