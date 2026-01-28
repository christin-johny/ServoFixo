import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, CheckCircle2, IndianRupee, 
  Receipt, ShieldCheck, Layers, Loader2, RefreshCw 
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

interface ExtendedJob extends Omit<JobDetails, 'service' | 'snapshots'> { 
  extraCharges?: ExtraCharge[];
  service?: { name: string; categoryId: string }; 
  snapshots?: {
    service?: { name: string };
    customer?: { name: string };
  };
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State to track view mode
  const [paymentStatus, setPaymentStatus] = useState<"IDLE" | "WAITING_FOR_PAYMENT" | "PAID">("IDLE");

  // --- 1. INITIAL LOAD & STATE RESTORATION ---
  useEffect(() => { loadJob(); }, [id]);

  const loadJob = async () => {
    try {
      if (!id) return;
      const data = await getTechnicianBookingById(id);
      const extendedData = data as ExtendedJob;
      setJob(extendedData);

      // --- LOGIC FIX: RESTORE STATE BASED ON BACKEND STATUS ---
      // If the user comes back and the status is ALREADY 'COMPLETED', 
      // it means they sent the bill previously. We must show the waiting screen.
      if (extendedData.status === 'COMPLETED') {
          setPaymentStatus("WAITING_FOR_PAYMENT");
      } 
      // If it's already paid, show the success screen
      else if (extendedData.status === 'PAID') {
          setPaymentStatus("PAID");
      }
      // Otherwise, it stays 'IDLE' (Invoice Review Mode)

    } catch { 
      showError("Failed to load job details."); 
    } finally { 
      setLoading(false); 
    }
  };

  // --- 2. POLLING: Watch for Payment Completion ---
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    // Start polling ONLY if we are in the waiting state
    if (paymentStatus === "WAITING_FOR_PAYMENT" && id) {
        interval = setInterval(async () => {
            try {
                const updatedJob = await getTechnicianBookingById(id);
                
                // If status changes to PAID, update UI and stop polling
                if (updatedJob.status === 'PAID') {
                    setPaymentStatus("PAID");
                    setJob(updatedJob as ExtendedJob);
                    showSuccess("Payment Received! Job Closed.");
                    clearInterval(interval);
                    
                    setTimeout(() => {
                        navigate("/technician/dashboard");
                    }, 2000);
                }
            } catch (err) {
                console.error("Polling error", err);
            }
        }, 3000); // Check every 3 seconds
    }

    return () => clearInterval(interval);
  }, [paymentStatus, id, navigate, showSuccess]);

  const handleSendBill = async () => {
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await completeJob(id);
      // Update local state to trigger the "Waiting" UI and Polling
      setPaymentStatus("WAITING_FOR_PAYMENT");
      showSuccess("Bill sent to customer. Waiting for payment...");
    } catch (err) {
      const error = err as ApiError;
      showError(error.response?.data?.message || "Failed to send bill");
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoaderFallback />;
  if (!job) return null;

  const serviceName = job.snapshots?.service?.name || job.service?.name || "Service Charge";
  const jobIdDisplay = job.id ? job.id.slice(-8).toUpperCase() : "UNKNOWN";

  const grandTotal = job.pricing?.estimated || 0; 
  const approvedExtras = (job.extraCharges || []).filter(e => e.status === "APPROVED");
  const extrasTotal = approvedExtras.reduce((sum, item) => sum + item.amount, 0);
  const baseServiceCharge = grandTotal - extrasTotal;

  // --- VIEW A: WAITING / PAID SCREEN ---
  // This renders automatically if loadJob() detects 'COMPLETED' or 'PAID'
  if (paymentStatus === "WAITING_FOR_PAYMENT" || paymentStatus === "PAID") {
      return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full space-y-6">
                
                {paymentStatus === "PAID" ? (
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                ) : (
                    <div className="relative w-20 h-20 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                        <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-blue-600 animate-pulse" />
                    </div>
                )}

                <div>
                    <h2 className="text-2xl font-black text-gray-900">
                        {paymentStatus === "PAID" ? "Payment Received!" : "Waiting for Payment"}
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                        {paymentStatus === "PAID" 
                           ? "The customer has paid the full amount. Great work!" 
                           : "The bill has been sent. Do not leave this page until the payment is confirmed."}
                    </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount Due</p>
                    <p className="text-3xl font-black text-gray-900">₹{grandTotal.toFixed(2)}</p>
                </div>

                {paymentStatus !== "PAID" && (
                     <div className="flex items-center justify-center gap-2 text-xs text-gray-400 animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Checking status...
                     </div>
                )}
            </div>
        </div>
      );
  }

  // --- VIEW B: INVOICE REVIEW (First Time Load) ---
  return (
    <div className="w-full min-h-screen bg-[#F8F9FC] flex flex-col font-sans text-gray-900 pb-48">
      
      {/* Header */}
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
                Generate Invoice
            </h1>
            <p className="text-sm text-gray-500">
                Send bill to customer and collect payment.
            </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8 space-y-6">

        {/* Invoice Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative animate-fade-in-up">
           <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm text-blue-600">
                    <Receipt className="w-6 h-6" />
                 </div>
                 <div>
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Invoice Summary</h2>
                    <p className="text-xs text-gray-500 font-mono">ID: {jobIdDisplay}</p>
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

           <div className="p-6 space-y-5">
              <div className="flex justify-between items-start">
                 <div className="flex gap-3">
                    <div className="mt-1"><Layers className="w-4 h-4 text-gray-400" /></div>
                    <div>
                        <p className="text-sm font-bold text-gray-900">Service Charge</p>
                        <p className="text-xs text-gray-500">{serviceName}</p>
                    </div>
                 </div>
                 <span className="font-bold text-gray-700">₹{baseServiceCharge.toFixed(2)}</span>
              </div>

              {approvedExtras.length > 0 && (
                <div className="space-y-3 pt-2">
                   {approvedExtras.map(item => (
                     <div key={item.id} className="flex justify-between items-center group">
                        <div className="flex gap-3 items-center">
                            <div className="w-4 flex justify-center"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div></div>
                            <span className="text-sm font-medium text-gray-600">{item.title}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-700">₹{item.amount.toFixed(2)}</span>
                     </div>
                   ))}
                </div>
              )}
              
              <div className="border-t-2 border-dashed border-gray-100 my-4"></div>

              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                 <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Grand Total</span>
                 <span className="text-xl font-black text-blue-600 flex items-center">
                    <IndianRupee className="w-5 h-5" />
                    {grandTotal.toFixed(2)}
                 </span>
              </div>
           </div>
        </div>

        {/* Safety Notice */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 animate-fade-in-up delay-100">
            <div className="p-2 bg-blue-100 rounded-full text-blue-600 h-fit">
                <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
                <h4 className="text-sm font-bold text-gray-900">Payment Protocol</h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Clicking below will mark the job as done and send a payment link to the customer. You must wait for confirmation.
                </p>
            </div>
        </div>
      </div>

      {/* Fixed Bottom Dock */}
      <div className="fixed bottom-[60px] md:bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 md:pl-72 safe-area-bottom shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
         <div className="max-w-3xl mx-auto">
            <button 
               onClick={handleSendBill}
               disabled={isSubmitting}
               className="w-full bg-gray-900 hover:bg-black text-white rounded-xl shadow-lg flex items-center justify-center gap-3 py-4 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
            >
               {isSubmitting ? (
                 <span className="font-bold animate-pulse">Processing...</span>
               ) : (
                 <>
                   <IndianRupee className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
                   <div className="text-left leading-none">
                       <span className="block text-[10px] font-bold uppercase opacity-60 text-gray-400 mb-0.5">Total: ₹{grandTotal.toFixed(2)}</span>
                       <span className="block text-lg font-bold">Send Bill & Collect Cash</span>
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