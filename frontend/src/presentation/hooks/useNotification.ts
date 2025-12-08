// src/presentation/hooks/useNotification.ts
import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';
import type { NotificationContextValue } from '../contexts/NotificationContext';

export const useNotification = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};
