import React, { useEffect } from "react";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

type ModalVariant = "danger" | "success" | "primary";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: ModalVariant; 
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
  variant = "danger",
}) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const themes = {
    danger: {
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      btnBg: "bg-red-600 hover:bg-red-700",
      btnShadow: "shadow-red-200",
      Icon: AlertTriangle
    },
    success: {
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      btnBg: "bg-green-600 hover:bg-green-700",
      btnShadow: "shadow-green-200",
      Icon: CheckCircle
    },
    primary: {
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      btnBg: "bg-blue-600 hover:bg-blue-700",
      btnShadow: "shadow-blue-200",
      Icon: Info
    }
  };

  const theme = themes[variant];
  const IconComponent = theme.Icon;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] transition-opacity" 
        onClick={onClose} 
      />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${theme.iconBg}`}>
              <IconComponent className={`w-7 h-7 ${theme.iconColor}`} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-8 px-2">{message}</p>
            
            <div className="grid grid-cols-2 gap-3 w-full">
              <button 
                onClick={onClose} 
                disabled={isLoading} 
                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors active:scale-[0.98]"
              >
                {cancelText}
              </button>
              <button 
                onClick={onConfirm} 
                disabled={isLoading} 
                className={`px-4 py-3 rounded-xl text-white font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${theme.btnBg} ${theme.btnShadow}`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;