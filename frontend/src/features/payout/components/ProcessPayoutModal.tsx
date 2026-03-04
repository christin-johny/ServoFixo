import React, { useState } from "react";
import { Landmark, IndianRupee, Hash, Loader2 } from "lucide-react";
import Modal from "../../../components/Shared/Modal/Modal";
import type { AdminPayoutDto } from "../types/AdminPayoutTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  payout: AdminPayoutDto | null;
  onConfirm: (id: string, referenceId: string) => Promise<void>;
}

const ProcessPayoutModal: React.FC<Props> = ({ isOpen, onClose, payout, onConfirm }) => {
  const [referenceId, setReferenceId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!payout) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceId.trim()) return;
    
    setIsProcessing(true);
    try {
      await onConfirm(payout.id, referenceId);
      setReferenceId(""); 
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Process Weekly Payout" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Summary Card */}
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
            <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Amount to Pay</p>
                <p className="text-2xl font-black text-blue-900 flex items-center mt-1">
                    <IndianRupee className="w-5 h-5" /> {payout.amount.toLocaleString()}
                </p>
            </div>
            <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Technician</p>
                <p className="text-sm font-bold text-slate-900">{payout.technicianName}</p>
            </div>
        </div>

        {/* Bank Details View */}
        <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Landmark className="w-4 h-4" /> Bank Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-slate-500 text-xs">Account Name</p>
                    <p className="font-bold text-slate-900">{payout.bankDetails.accountHolderName}</p>
                </div>
                <div>
                    <p className="text-slate-500 text-xs">Bank</p>
                    <p className="font-bold text-slate-900">{payout.bankDetails.bankName}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-slate-500 text-xs">Account Number</p>
                    <p className="font-mono font-bold text-slate-900 text-lg tracking-widest">{payout.bankDetails.accountNumber}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-slate-500 text-xs">IFSC Code</p>
                    <p className="font-mono font-bold text-slate-900 uppercase">{payout.bankDetails.ifscCode}</p>
                </div>
            </div>
        </div>

        {/* Input Field for Admin */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
            <Hash className="w-4 h-4 text-gray-400" /> Bank Transaction ID / UTR <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            placeholder="e.g. UTR1234567890"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono"
          />
          <p className="text-[10px] text-gray-500 mt-2">
            Enter the reference number from your bank after transferring the funds. The technician will see this ID in their app.
          </p>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing || !referenceId.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Payout"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProcessPayoutModal;