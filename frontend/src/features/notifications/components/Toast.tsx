
import React, { useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { Notification } from '../context/NotificationContext';

interface ToastProps {
  notification: Notification;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <CheckCircle size={20} className="shrink-0" />;
      case 'error': return <XCircle size={20} className="shrink-0" />;
      case 'info': return <Info size={20} className="shrink-0" />;
      case 'warning': return <AlertTriangle size={20} className="shrink-0" />;
    }
  };

  const getColorClasses = () => {
    switch (notification.type) {
      case 'success': return 'bg-green-600 text-white';
      case 'error': return 'bg-red-600 text-white';
      case 'info': return 'bg-blue-600 text-white';
      case 'warning': return 'bg-amber-600 text-white';
    }
  };

  return (
    <div
      role="alert"
      className={`
        ${getColorClasses()}
        rounded-lg shadow-lg p-4 pr-10
        min-w-[320px] max-w-md
        relative
        transition-all duration-300 ease-out
        ${isExiting
          ? 'opacity-0 translate-x-full'
          : 'opacity-100 translate-x-0 animate-in slide-in-from-right-4 fade-in'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {getIcon()}

        <div className="flex-1 min-w-0">
          {notification.title && (
            <h3 className="font-bold text-base mb-0.5 tracking-wide">
              {notification.title}
            </h3>
          )}
          <p className="text-sm leading-snug opacity-95 font-medium">
            {notification.message}
          </p>
        </div>
      </div>

      <button
        onClick={handleClose}
        className="absolute top-3 right-3 p-1 rounded-md hover:bg-white/20 transition-colors"
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;