
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-8">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-red-50 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" />
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
            className="px-6 py-3 text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all flex items-center gap-2 shadow-sm"
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