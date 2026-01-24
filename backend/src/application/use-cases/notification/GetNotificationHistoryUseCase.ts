import { IUseCase } from "../../interfaces/IUseCase";
import { INotificationRepository, NotificationFilterParams, PaginatedNotificationResult } from "../../../domain/repositories/INotificationRepository";
import { NotificationResponseDto } from "../../dto/notification/NotificationResponseDto";
import { NotificationMapper } from "../../mappers/NotificationMapper";
 

export interface GetNotificationsInput {
  recipientId: string;
  page?: number;
  limit?: number;
}

export class GetNotificationHistoryUseCase implements IUseCase<PaginatedNotificationResult & { notifications: NotificationResponseDto[] }, [GetNotificationsInput]> {
  constructor(
    private readonly _notificationRepo: INotificationRepository 
  ) {}

  async execute(input: GetNotificationsInput): Promise<any> {
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