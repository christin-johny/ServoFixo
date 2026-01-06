import React from 'react';
import { AlertTriangle, X, CheckCircle, Info } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean; 
  customContent?: React.ReactNode; 
  variant?: "danger" | "success" | "info"; 
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  customContent,
  variant = "danger",  
}) => {
  if (!isOpen) return null;
 
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          iconBg: "bg-green-50",
          iconColor: "text-green-600",
          btnBg: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
          Icon: CheckCircle
        };
      case "info":
        return {
          iconBg: "bg-blue-50",
          iconColor: "text-blue-600",
          btnBg: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
          Icon: Info
        };
      case "danger":
      default:
        return {
          iconBg: "bg-red-50",
          iconColor: "text-red-600",
          btnBg: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
          Icon: AlertTriangle
        };
    }
  };

  const { iconBg, iconColor, btnBg, Icon } = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-8">
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-full ${iconBg}`}>
              <Icon className={`w-8 h-8 ${iconColor}`} />
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="mt-5">
            <h3 className="text-2xl font-bold text-gray-900">
              {title}
            </h3>
            <p className="text-lg text-gray-600 mt-3 leading-relaxed">
              {message}
            </p>
             
            {customContent && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                {customContent}
              </div>
            )}
          </div>
        </div>

        <div className="px-8 py-5 bg-gray-50 flex justify-end gap-4 border-t border-gray-100">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-3 text-base font-medium text-white rounded-lg focus:ring-2 focus:ring-offset-1 transition-all flex items-center gap-2 shadow-sm ${btnBg}`}
          >
            {isLoading && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;