import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

// --- FORCE CANCEL MODAL ---
interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export const ForceCancelModal: React.FC<CancelModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    await onConfirm(reason);
    setLoading(false);
    setReason(""); 
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3 text-red-600">
            <div className="p-2 bg-red-100 rounded-lg"><AlertTriangle size={24} /></div>
            <h3 className="text-lg font-bold">Force Cancel Booking</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        
        <p className="text-gray-600 mb-4 text-sm">
          This will stop the job immediately. Since payment is collected at the end, 
          <strong> no refunds </strong> will be processed.
        </p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason (e.g., 'Customer called to cancel')"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none h-24 text-sm mb-4"
        />

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Dismiss</button>
          <button 
            onClick={handleSubmit} 
            disabled={loading || !reason.trim()}
            className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Cancelling..." : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- FORCE COMPLETE MODAL ---
interface CompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const ForceCompleteModal: React.FC<CompleteModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Mark as Completed?</h3>
          <p className="text-gray-500 text-sm mt-2">
            This will mark the job as finished and generate the invoice for the customer.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Yes, Complete Job"}
          </button>
        </div>
      </div>
    </div>
  );
};