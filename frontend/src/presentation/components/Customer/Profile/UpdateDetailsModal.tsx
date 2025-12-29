import React, { useState, useEffect } from 'react';
import { X, User, Smartphone, Save, Loader2, AlertCircle } from 'lucide-react';

interface UpdateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: { name: string; phone: string; email: string };
  onUpdate: (data: { name: string; phone: string }) => Promise<void>;
}

const UpdateDetailsModal: React.FC<UpdateDetailsModalProps> = ({ isOpen, onClose, initialData, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    phone: initialData.phone || '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: initialData.name || '',
        phone: initialData.phone || '',
      });
    } else {
      setFormData({ name: '', phone: '' });
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const validate = () => {
    if (formData.name.trim().length < 3) {
      setError("Name must be at least 3 characters.");
      return false;
    }
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(formData.name)) {
      setError("Name can only contain letters and spaces.");
      return false;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number.");
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
      await onUpdate(formData); 
    } catch (err: unknown) {
      const message = err.response?.data?.message || "Failed to update profile.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">Update Profile Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Backend & Validation Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm font-bold animate-shake">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Email (Non-editable)</label>
            <div className="p-3 bg-gray-50 border rounded-xl text-gray-400 text-sm italic">{initialData.email}</div>
          </div>

          <div className="relative">
            <User className="absolute left-3 top-9 text-gray-400" size={16} />
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Full Name</label>
            <input 
              type="text" 
              className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm outline-none transition-all ${error?.includes('Name') ? 'border-red-500 ring-1 ring-red-100' : 'focus:ring-2 focus:ring-blue-600/20'}`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="relative">
            <Smartphone className="absolute left-3 top-9 text-gray-400" size={16} />
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Phone Number</label>
            <input 
              type="text" 
              className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl text-sm outline-none transition-all ${error?.includes('Phone') ? 'border-red-500 ring-1 ring-red-100' : 'focus:ring-2 focus:ring-blue-600/20'}`}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:bg-gray-300"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isSubmitting ? 'Saving...' : 'Update Details'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateDetailsModal;