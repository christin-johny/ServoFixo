import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

const CANCELLATION_REASONS = [
  "Vehicle Breakdown",
  "Accident / Medical Emergency",
  "Cannot Locate Address",
  "Customer Behavior Issue",
  "Tools/Equipment Failure",
  "Other"
];

const CancellationModal: React.FC<CancellationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading
}) => {
  const [selectedReason, setSelectedReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3">
            <div className="bg-white p-2 rounded-full text-red-600 shadow-sm">
                <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-red-900">Cancel Job?</h3>
                <p className="text-xs text-red-700">This may affect your rating.</p>
            </div>
            <button onClick={onClose} className="ml-auto text-red-400 hover:text-red-700">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Body */}
        <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
                Select a Reason
            </label>
            <div className="space-y-2 mb-6">
                {CANCELLATION_REASONS.map((reason) => (
                    <label 
                        key={reason} 
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedReason === reason 
                                ? "border-red-500 bg-red-50" 
                                : "border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                        <input 
                            type="radio" 
                            name="cancelReason" 
                            value={reason}
                            checked={selectedReason === reason}
                            onChange={(e) => setSelectedReason(e.target.value)}
                            className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300"
                        />
                        <span className={`text-sm ${selectedReason === reason ? "font-bold text-red-700" : "text-gray-600"}`}>
                            {reason}
                        </span>
                    </label>
                ))}
            </div>

            <button
                onClick={() => onConfirm(selectedReason)}
                disabled={!selectedReason || isLoading}
                className="w-full bg-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-200 disabled:opacity-50 disabled:shadow-none hover:bg-red-700 transition-all active:scale-[0.98]"
            >
                {isLoading ? "Cancelling..." : "Confirm Cancellation"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;