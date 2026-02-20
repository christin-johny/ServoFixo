import React, { useState } from "react";
import { X, AlertTriangle, RefreshCw } from "lucide-react";
import type { BookingStatus } from "../../api/adminBookingRepository";

interface ForceStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: string;
  onUpdate: (newStatus: string, reason: string) => Promise<void>;
}

const ALL_STATUSES: BookingStatus[] = [
  "REQUESTED", "ASSIGNED_PENDING", "ACCEPTED", "EN_ROUTE", 
  "REACHED", "IN_PROGRESS", "EXTRAS_PENDING", 
  "COMPLETED", "PAID", "CANCELLED", "FAILED_ASSIGNMENT"
];

const ForceStatusModal: React.FC<ForceStatusModalProps> = ({ 
  isOpen, onClose, currentStatus, onUpdate 
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>(currentStatus);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    await onUpdate(selectedStatus, reason);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3 text-orange-600">
            <div className="p-2 bg-orange-100 rounded-lg"><RefreshCw size={24} /></div>
            <h3 className="text-lg font-bold">Override Booking Status</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs p-3 rounded-lg mb-4 flex gap-2">
           <AlertTriangle size={16} className="shrink-0" />
           <p>Warning: Changing status manually may bypass checks (OTP, Payments). Use with caution.</p>
        </div>

        {/* Status Dropdown */}
        <div className="mb-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">New Status</label>
            <select 
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg font-mono text-sm"
            >
                {ALL_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>
        </div>

        {/* Reason Input */}
        <div className="mb-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Reason (Required)</label>
            <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why are you forcing this change?"
                className="w-full p-2 border border-gray-300 rounded-lg text-sm h-20 outline-none focus:ring-2 focus:ring-orange-500"
            />
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
          <button 
            onClick={handleConfirm}
            disabled={loading || !reason.trim() || selectedStatus === currentStatus}
            className="px-6 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Status"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ForceStatusModal;