import { IServiceItemRepository } from '../../../domain/repositories/IServiceItemRepository';


export class DeleteServiceItemUseCase {
  constructor(
    private readonly serviceRepo: IServiceItemRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const service = await this.serviceRepo.findById(id);
    if (!service) throw new Error('Service Item not found');

    await this.serviceRepo.delete(id);
  }
}