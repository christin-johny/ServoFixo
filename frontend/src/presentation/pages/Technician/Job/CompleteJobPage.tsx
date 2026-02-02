import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; 
import { 
  ArrowLeft, CheckCircle2, IndianRupee, 
  Receipt, ShieldCheck, Layers, Loader2, RefreshCw,
  Camera, X 
} from "lucide-react";
import { useNotification } from "../../../hooks/useNotification";
import { getTechnicianBookingById, completeJob } from "../../../../infrastructure/repositories/technician/technicianBookingRepository";
import { socketService } from "../../../../infrastructure/api/socketClient"; 
import {type  RootState } from "../../../../store/store";  
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
  const { user } = useSelector((state: RootState) => state.auth); // ✅ Get Tech ID

  const [job, setJob] = useState<ExtendedJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
const [proofFile, setProofFile] = useState<File | null>(null); // ✅ State for File
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

      if (extendedData.status === 'COMPLETED') {
          setPaymentStatus("WAITING_FOR_PAYMENT");
      } else if (extendedData.status === 'PAID') {
          setPaymentStatus("PAID");
      }
    } catch { 
      showError("Failed to load job details."); 
    } finally { 
      setLoading(false); 
    }
  };

  // ✅ Socket Logic: Real-Time Sync
  useEffect(() => {
    if (!id || !user?.id) return;

    socketService.connect(user.id, "TECHNICIAN");

    // A. Listen for Charge Updates (Updates final bill if approved late)
    socketService.onChargeUpdate((data) => {
        if (data.bookingId === id) loadJob();
    });

    // B. Listen for Payment Updates (No more polling needed!)
    socketService.onBookingStatusUpdate((data) => {
        if (data.bookingId === id && data.status === 'PAID') {
             setPaymentStatus("PAID");
             showSuccess("Payment Received! Job Closed.");
             setTimeout(() => {
                navigate("/technician/dashboard");
             }, 2000);
        }
    });

    return () => {
        socketService.offTrackingListeners();
    };
  }, [id, user?.id]);

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) return showError("File size must be < 5MB");
      setProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setProofFile(null);
    setPreviewUrl(null);
  };

  const handleSendBill = async () => {
    if (!id) return;
    if (!proofFile) return showError("Work proof photo is required."); // ✅ Validation

    setIsSubmitting(true);
    try {
      // ✅ Use completeJob with File (You need to update your repo function to accept file)
      await completeJob(id, proofFile); 
      setPaymentStatus("WAITING_FOR_PAYMENT");
      showSuccess("Bill sent to customer.");
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

const baseServiceCharge = job.pricing?.estimated || 0; 

  // 2. Calculate Extras (e.g., 200)
  const approvedExtras = (job.extraCharges || []).filter(e => e.status === "APPROVED");
  const extrasTotal = approvedExtras.reduce((sum, item) => sum + item.amount, 0);

  // 3. Grand Total is Base + Extras (e.g., 700)
  const grandTotal = baseServiceCharge + extrasTotal;

  // --- VIEW A: WAITING / PAID SCREEN ---
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

  // --- VIEW B: INVOICE REVIEW ---
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

<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-fade-in-up">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" /> Work Proof (Required)
            </h3>
            
            {!previewUrl ? (
                <label className="group flex flex-col items-center justify-center w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                            <Camera className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
                        </div>
                        <p className="text-sm font-semibold text-gray-600">Click to take photo</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
            ) : (
                <div className="relative w-full h-56 rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                    <img src={previewUrl} alt="Work Proof" className="w-full h-full object-cover" />
                    <button onClick={removeImage} className="absolute top-2 right-2 p-2 bg-white rounded-full text-red-600 shadow-lg hover:scale-110 transition-transform">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready to Upload
                    </div>
                </div>
            )}
        </div>
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