import { IServiceItemRepository } from '../../../domain/repositories/IServiceItemRepository';

export class ToggleServiceItemStatusUseCase {
  constructor(private readonly _serviceRepo: IServiceItemRepository) {}

  async execute(id: string, isActive: boolean): Promise<void> {
    const success = await this._serviceRepo.toggleStatus(id, isActive);
    if (!success) {
      throw new Error('Service Item not found or update failed');
    }
  }
}