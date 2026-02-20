import React, { useState, useEffect } from 'react';
import { X, Lock, Eye, EyeOff, Save, Loader2, AlertCircle } from 'lucide-react';
import { usePasswordStrength } from '../../../../components/PasswordStrength/usePasswordStrength';
import PasswordStrength from '../../../../components/PasswordStrength/PasswordStrength';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { currentPassword: string; newPassword: string }) => Promise<void>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { checks } = usePasswordStrength(formData.newPassword);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setError(null);
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    if (!formData.currentPassword) {
      setError("Current password is required.");
      return false;
    }
    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return false;
    }
    if (!checks.uppercase || !checks.lowercase || !checks.number || !checks.special) {
      setError("Please meet all password strength requirements.");
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onConfirm({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      onClose();
    } catch (err: unknown) {
      let message = "Failed to update password. Please try again.";
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        const axiosErr = err as {
          response?: { data?: { message?: string } };
        };
        message = axiosErr.response?.data?.message || message;
      }
      setError(message);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-gray-200">

        <div className="p-5 border-b flex justify-between items-center bg-white">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-gray-900">Security Settings</h3>
            <p className="text-xs text-gray-500">Update your account password</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm font-semibold animate-shake">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Current Password</label>
            <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Lock className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Current Password"
                className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-400 text-sm"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="ml-2 text-gray-400 hover:text-gray-600">
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">New Password</label>
            <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Lock className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <input
                type={showNew ? "text" : "password"}
                placeholder="New Password"
                className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-400 text-sm"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="ml-2 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <PasswordStrength password={formData.newPassword} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Confirm New Password</label>
            <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Lock className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter new password"
                className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-400 text-sm"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="ml-2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-blue-200"
              }`}
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {isSubmitting ? 'Updating Security...' : 'Update Password'}
          </button>

          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
            If you don't remember your password, please logout and use the <br />
            <span className="font-bold text-gray-600 ">Forgot Password</span> option.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;