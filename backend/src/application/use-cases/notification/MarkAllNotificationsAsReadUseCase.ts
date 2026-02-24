 
import { INotificationRepository } from "../../../domain/repositories/INotificationRepository";
import { IMarkAllNotificationsAsReadUseCase } from "../../interfaces/use-cases/notification/INotificationUseCases";
 

export class MarkAllNotificationsAsReadUseCase implements IMarkAllNotificationsAsReadUseCase {
  constructor(
    private readonly _notificationRepo: INotificationRepository 
  ) {}

  async execute(recipientId: string): Promise<void> {
    await this._notificationRepo.markAllAsRead(recipientId);
  }
}