 
import { useContext } from 'react';
import { NotificationContext, type NotificationContextValue  } from '../context/NotificationContext';

export const useNotification = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return context;
};
