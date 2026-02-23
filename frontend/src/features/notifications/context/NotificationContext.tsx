 
import React, { createContext, useCallback, useState } from 'react';
import type { ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
}

export interface NotificationContextValue {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showSuccess: (message: string, title?: string, duration?: number) => void;
  showError: (message: string, title?: string, duration?: number) => void;
  showInfo: (message: string, title?: string, duration?: number) => void;
  showWarning: (message: string, title?: string, duration?: number) => void;
  removeNotification: (id: string) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

const generateId = (): string => {
  return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 4000,
    };

    setNotifications((prev) => [...prev, newNotification]);
 
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, [removeNotification]);

  const showSuccess = useCallback((message: string, title?: string, duration?: number) => {
    showNotification({
      type: 'success',
      title: title ?? 'Success!',
      message,
      duration,
    });
  }, [showNotification]);

  const showError = useCallback((message: string, title?: string, duration?: number) => {
    showNotification({
      type: 'error',
      title: title ?? 'Error!',
      message,
      duration,
    });
  }, [showNotification]);

  const showInfo = useCallback((message: string, title?: string, duration?: number) => {
    showNotification({
      type: 'info',
      title: title ?? 'Info',
      message,
      duration,
    });
  }, [showNotification]);

  const showWarning = useCallback((message: string, title?: string, duration?: number) => {
    showNotification({
      type: 'warning',
      title: title ?? 'Warning!',
      message,
      duration,
    });
  }, [showNotification]);

  const value: NotificationContextValue = {
    notifications,
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
