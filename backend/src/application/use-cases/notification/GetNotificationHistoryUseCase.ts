import { INotificationRepository } from "../../../domain/repositories/INotificationRepository";
import { NotificationMapper } from "../../mappers/NotificationMapper";
import { 
  IGetNotificationHistoryUseCase, 
  NotificationHistoryResponse 
} from "../../interfaces/use-cases/notification/INotificationUseCases";
import { GetNotificationsInputDto } from "../../dto/notification/NotificationResponseDto";

export class GetNotificationHistoryUseCase implements IGetNotificationHistoryUseCase {
  constructor(
    private readonly _notificationRepo: INotificationRepository 
  ) {}

  async execute(input: GetNotificationsInputDto): Promise<NotificationHistoryResponse> {
    const result = await this._notificationRepo.findByRecipient({
      recipientId: input.recipientId,
      page: input.page || 1,
      limit: input.limit || 20
    });
 
    return {
      notifications: result.data.map(n => NotificationMapper.toResponse(n)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      unreadCount: result.unreadCount
    };
  }
}