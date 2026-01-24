import { IUseCase } from "../../interfaces/IUseCase";
import { INotificationRepository } from "../../../domain/repositories/INotificationRepository";
 

export class MarkAllNotificationsAsReadUseCase implements IUseCase<void, [string]> {
  constructor(
    private readonly _notificationRepo: INotificationRepository 
  ) {}

  async execute(recipientId: string): Promise<void> {
    await this._notificationRepo.markAllAsRead(recipientId);
  }
}