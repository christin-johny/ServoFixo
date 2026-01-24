import { IUseCase } from "../../interfaces/IUseCase";
import { INotificationRepository } from "../../../domain/repositories/INotificationRepository";
 

export class MarkNotificationAsReadUseCase implements IUseCase<void, [string]> {
  constructor(
    private readonly _notificationRepo: INotificationRepository 
  ) {}

  async execute(notificationId: string): Promise<void> {
    await this._notificationRepo.markAsRead(notificationId);
  }
}