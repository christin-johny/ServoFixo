import { Notification} from "../entities/Notification";
import { NotificationStatus } from "../value-objects/NotificationTypes";
import { IBaseRepository } from "./IBaseRepository";

export interface NotificationFilterParams {
  recipientId: string;
  status?: NotificationStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedNotificationResult {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;  
}

export interface INotificationRepository extends IBaseRepository<Notification> {
 
  findByRecipient(
    filters: NotificationFilterParams
  ): Promise<PaginatedNotificationResult>;

 
  markAsRead(notificationId: string): Promise<void>;

 
  markAllAsRead(recipientId: string): Promise<void>;

 
  getUnreadCount(recipientId: string): Promise<number>;

 
  deleteExpired(olderThan: Date): Promise<number>;
}