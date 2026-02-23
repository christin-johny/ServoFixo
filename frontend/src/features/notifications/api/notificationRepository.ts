import axiosClient from "../../../lib/axiosClient";
import { NOTIFICATION_ENDPOINTS } from "./endpoints";
import type { Notification } from "../../../features/notifications/types/Notification";

export interface PaginatedNotifications {
 notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}

export const notificationRepository = {
 
  getNotifications: async (page: number = 1, limit: number = 20): Promise<PaginatedNotifications> => {
    const response = await axiosClient.get(NOTIFICATION_ENDPOINTS.GET_ALL, {
      params: { page, limit },
    });
    return response.data.data;
  },
 
  markAsRead: async (notificationId: string): Promise<void> => {
    await axiosClient.patch(NOTIFICATION_ENDPOINTS.MARK_READ(notificationId));
  },
 
  markAllAsRead: async (): Promise<void> => {
    await axiosClient.post(NOTIFICATION_ENDPOINTS.MARK_ALL_READ);
  },
};