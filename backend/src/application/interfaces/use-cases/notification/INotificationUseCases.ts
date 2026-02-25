import { GetNotificationsInputDto, NotificationResponseDto } from "../../../dto/notification/NotificationResponseDto";
import { PaginatedNotificationResult } from "../../../../domain/repositories/INotificationRepository";


export interface NotificationHistoryResponse extends Omit<PaginatedNotificationResult, 'data'> {
  notifications: NotificationResponseDto[];
  unreadCount: number;
}
 

export interface IGetNotificationHistoryUseCase {
 
  execute(input: GetNotificationsInputDto): Promise<NotificationHistoryResponse>;
}

export interface IMarkNotificationAsReadUseCase {

  execute(notificationId: string): Promise<void>;
}

export interface IMarkAllNotificationsAsReadUseCase {
 
  execute(recipientId: string): Promise<void>;
}