import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { socketService } from "../../infrastructure/api/socketClient";
import { notificationRepository } from "../../infrastructure/repositories/technician/notificationRepository"; 
import { addNotification, setNotifications, markRead, markAllRead, setLoading, setError } from "../../store/notificationSlice";
import type { Notification } from "../../domain/types/Notification";
import { useNotification } from "./useNotification"; 

export const useCustomerNotifications = () => {
  const dispatch = useDispatch();
  const { showSuccess } = useNotification(); 
  const { notifications, unreadCount, loading } = useSelector((state: RootState) => state.notifications);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  useEffect(() => {
    if (userId) {
      socketService.connect(userId, "CUSTOMER");

      socketService.onNotification((notification: Notification) => {
        dispatch(addNotification(notification));
        showSuccess(notification.title); 
      });
    }
    return () => { socketService.offNotification(); };
  }, [userId, dispatch, showSuccess]);

  const fetchNotifications = useCallback(async (page: number = 1) => {
    dispatch(setLoading(true));
    try {
      const result = await notificationRepository.getNotifications(page); 
      dispatch(setNotifications(result)); 
    } catch {
      dispatch(setError("Failed to load notifications"));
    }
  }, [dispatch]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationRepository.markAsRead(id);
      dispatch(markRead(id));
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationRepository.markAllAsRead();
      dispatch(markAllRead());
    } catch (err) { console.error(err); }
  };

  return { notifications, unreadCount, loading, fetchNotifications, handleMarkAsRead, handleMarkAllRead };
};