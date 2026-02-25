 import { INotificationRepository } from "../../../domain/repositories/INotificationRepository";
import { IMarkNotificationAsReadUseCase } from "../../interfaces/use-cases/notification/INotificationUseCases";
 

export class MarkNotificationAsReadUseCase implements IMarkNotificationAsReadUseCase {
  constructor(
    private readonly _notificationRepo: INotificationRepository 
  ) {}

  async execute(notificationId: string): Promise<void> {
    await this._notificationRepo.markAsRead(notificationId);
  }
}