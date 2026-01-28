import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, CheckCircle2, IndianRupee, 
  Receipt, ShieldCheck, Layers 
} from "lucide-react";
import { useNotification } from "../../../hooks/useNotification";
import { getTechnicianBookingById, completeJob } from "../../../../infrastructure/repositories/technician/technicianBookingRepository";
import LoaderFallback from "../../../components/LoaderFallback";
import type { JobDetails } from "../../../../domain/types/JobDetails";

// --- Types ---
interface ExtraCharge {
  id: string; 
  title: string; 
  amount: number; 
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface ExtendedJob extends JobDetails { 
  extraCharges?: ExtraCharge[]; 
}

interface ApiError {
  response?: { data?: { message?: string } };
}

const CompleteJobPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [job, setJob] = useState<ExtendedJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadJob(); }, [id]);

  const loadJob = async () => {
    try {
      if (!id) return;
      const data = await getTechnicianBookingById(id);
      setJob(data as ExtendedJob);
    } catch { 
      showError("Failed to load job details."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleComplete = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      await completeJob(id);
      showSuccess("Job Closed Successfully");
      // Navigate to Dashboard or specific success view
      navigate("/technician/dashboard"); 
    } catch (err) {
      const error = err as ApiError;
      showError(error.response?.data?.message || "Failed to complete job");
      setSubmitting(false);
    }
  };

  if (loading) return <LoaderFallback />;
  if (!job) return null;

  // --- LOGIC: Reverse Calculate Base Price ---
  // Assumption: job.pricing.estimated INCLUDES the approved extras.
  const grandTotal = job.pricing.estimated; 
  
  const approvedExtras = (job.extraCharges || []).filter(e => e.status === "APPROVED");
  const extrasTotal = approvedExtras.reduce((sum, item) => sum + item.amount, 0);
  
  // Base Service Charge = Total - Extras
  const baseServiceCharge = grandTotal - extrasTotal;

  return (
    <div className="w-full min-h-screen bg-[#F8F9FC] flex flex-col font-sans text-gray-900 pb-32">
      
      {/* --- 1. HEADER --- */}
      <div className="space-y-4 pt-4 px-4 md:px-8 max-w-3xl mx-auto w-full">
        <div>
            <button
                onClick={() => navigate(-1)}
                className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors px-1"
            >
                <div className="p-1 rounded-full bg-white border border-gray-200 group-hover:border-gray-300 shadow-sm transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                Back to Job
            </button>
        </div>

        <div className="flex flex-col gap-1 px-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Final Review
            </h1>
            <p className="text-sm text-gray-500">
                Verify the invoice breakdown before closing.
            </p>
        </div>
      </div>

      {/* --- 2. MAIN CONTENT --- */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8 space-y-6">

        {/* --- INVOICE CARD --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative animate-fade-in-up">
           {/* Decorative Header */}
           <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm text-blue-600">
                    <Receipt className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Invoice Summary</h2>
                    <p className="text-xs text-gray-500 font-mono">ID: {job.id.slice(-8).toUpperCase()}</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Payable</p>
                 <p className="text-2xl font-black text-gray-900 flex items-center justify-end">
                    <IndianRupee className="w-5 h-5 mt-1 text-gray-400" />
                    {grandTotal.toFixed(2)}
                 </p>
              </div>
           </div>

           {/* Breakdown List */}
           <div className="p-6 space-y-5">
              
              {/* 1. Base Service Charge */}
              <div className="flex justify-between items-start">
                 <div className="flex gap-3">
                    <div className="mt-1">
                        <Layers className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">Service Charge</p>
                        <p className="text-xs text-gray-500">{job.snapshots.service.name}</p>
                    </div>
                 </div>
                 <span className="font-bold text-gray-700">₹{baseServiceCharge.toFixed(2)}</span>
              </div>

              {/* 2. Approved Extras List */}
              {approvedExtras.length > 0 && (
                <div className="space-y-3 pt-2">
                   {approvedExtras.map(item => (
                     <div key={item.id} className="flex justify-between items-center group">
                        <div className="flex gap-3 items-center">
                            <div className="w-4 flex justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            </div>
                            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                                {item.title}
                            </span>
                        </div>
                        <span className="text-sm font-bold text-gray-700">₹{item.amount.toFixed(2)}</span>
                     </div>
                   ))}
                </div>
              )}
              
              {/* Divider */}
              <div className="border-t-2 border-dashed border-gray-100 my-4"></div>

              {/* 3. Grand Total */}
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                 <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Grand Total</span>
                 <span className="text-xl font-black text-blue-600 flex items-center">
                    <IndianRupee className="w-5 h-5" />
                    {grandTotal.toFixed(2)}
                 </span>
              </div>
           </div>
        </div>

        {/* --- SAFETY NOTICE --- */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 animate-fade-in-up delay-100">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600 h-fit">
                <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-gray-900">Closing Protocol</h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Confirming will finalize this invoice and trigger the customer payment flow. This action cannot be undone.
                </p>
            </div>
        </div>
      </div>

      {/* --- 3. FIXED BOTTOM DOCK (Industrial Standard) --- */}
      <div className="fixed bottom-[60px] md:bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 md:pl-72 safe-area-bottom shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
         <div className="max-w-3xl mx-auto">
            <button 
               onClick={handleComplete}
               disabled={submitting}
               className="w-full bg-gray-900 hover:bg-black text-white rounded-xl shadow-lg flex items-center justify-center gap-3 py-4 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
            >
               {submitting ? (
                 <span className="font-bold animate-pulse">Processing...</span>
               ) : (
                 <>
                   <CheckCircle2 className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
                   <div className="text-left leading-none">
                       <span className="block text-[10px] font-bold uppercase opacity-60 text-gray-400 mb-0.5">Final Step</span>
                       <span className="block text-lg font-bold">Confirm & Close Job</span>
                   </div>
                 </>
               )}
            </button>
         </div>
      </div>

    </div>
  );
};

export default CompleteJobPage;