import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import { socketService } from "../../../lib/socketClient";
import { notificationRepository } from "../api/notificationRepository";
import { addNotification, setNotifications, markRead, markAllRead, setLoading, setError } from "../../../store/notificationSlice";
import type { Notification } from "../types/Notification";
import { useNotification } from "./useNotification"; 

export const useTechnicianNotifications = () => {
  const dispatch = useDispatch();
  const { showSuccess } = useNotification(); 
  const { notifications, unreadCount, loading } = useSelector((state: RootState) => state.notifications);
  const techId = useSelector((state: RootState) => state.auth.user?.id);

  useEffect(() => {
    if (techId) {
      // UPDATE: Connect identifying as a TECHNICIAN
      socketService.connect(techId, "TECHNICIAN");

      socketService.onNotification((notification: Notification) => {
        dispatch(addNotification(notification));
        showSuccess(`New Alert: ${notification.title}`);
      });
    }

    return () => {
      // We don't necessarily want to disconnect strictly here if other components need it,
      // but we definitely want to stop listening to notifications for this hook instance.
      socketService.offNotification();
    };
  }, [techId, dispatch, showSuccess]);

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
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationRepository.markAllAsRead();
      dispatch(markAllRead());
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  return { notifications, unreadCount, loading, fetchNotifications, handleMarkAsRead, handleMarkAllRead };
};