import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // ✅ Needed for user ID
import { 
  ArrowLeft, Plus, Tag, IndianRupee, Camera, X, 
  FileText, CheckCircle2, AlertTriangle, Clock, Ban 
} from "lucide-react"; 
import { useNotification } from "../../../hooks/useNotification";
import { getTechnicianBookingById, addExtraCharge } from "../../../../infrastructure/repositories/technician/technicianBookingRepository";
import { socketService } from "../../../../infrastructure/api/socketClient"; // ✅ Import Socket
import {type  RootState } from "../../../../store/store"; // ✅ Import RootState
import LoaderFallback from "../../../components/LoaderFallback";
import type { JobDetails } from "../../../../domain/types/JobDetails";

// --- 1. DEFINE TYPES ---
interface ExtraCharge {
  id: string;
  title: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

// Extend JobDetails to include extraCharges if not already present
interface ExtendedJobDetails extends JobDetails {
  extraCharges: ExtraCharge[];
}

interface ApiError {
  response?: { data?: { message?: string } };
}

const CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  MAX_NAME_LENGTH: 50,
  MAX_PRICE: 100000,
};

const AddExtrasPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  const { user } = useSelector((state: RootState) => state.auth); // ✅ Get Tech ID

  const [job, setJob] = useState<ExtendedJobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Define loadJob outside useEffect so it can be called by listeners
  const loadJob = async () => {
    try {
      if (!id) return;
      const data = await getTechnicianBookingById(id);
      setJob(data as ExtendedJobDetails);
    } catch  {
      showError("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Socket Logic
  useEffect(() => {
    if (!id || !user?.id) return;

    // 1. Initial Load
    loadJob();

    // 2. Connect Socket
    socketService.connect(user.id, "TECHNICIAN");

    // 3. Listen for Charge Updates (Customer Approved/Rejected)
    socketService.onChargeUpdate((data) => { 
      if (data.bookingId === id) {
        loadJob(); 
      }
    });

    // 4. Listen for Status Updates (e.g. Back to IN_PROGRESS)
    socketService.onBookingStatusUpdate((data) => {
        if (data.bookingId === id) {
            loadJob();
        }
    });

    // Cleanup
    return () => {
        socketService.offTrackingListeners();
    };
  }, [id, user?.id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > CONSTANTS.MAX_FILE_SIZE) {
        return showError("File size must be less than 5MB");
      }
      setProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setProofFile(null);
    setPreviewUrl(null);
  };

  const handleAddItem = async () => {
    if (!itemName.trim()) return showError("Item name is required");
    if (!itemPrice || Number(itemPrice) <= 0) return showError("Valid price required");
    if (!proofFile) return showError("Proof photo is required");
    if (!id) return;

    setSubmitting(true);
    try {
      await addExtraCharge(id, {
        title: itemName.trim(),
        amount: Number(itemPrice),
        proofFile: proofFile || undefined
      });

      // Clear Form
      setItemName("");
      setItemPrice("");
      removeImage();
      
      showSuccess("Request sent to customer!");
      
      // Reload to fetch the new item from server with 'PENDING' status
      await loadJob(); 
    } catch (err) {
      const error = err as ApiError;
      showError(error.response?.data?.message || "Failed to add charge");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoaderFallback />;
  if (!job) return null;

  // --- CALCULATION LOGIC ---
  const basePrice = job.pricing.estimated;
  const approvedOrPendingExtras = (job.extraCharges || []).filter(item => item.status !== 'REJECTED');
  const extrasTotal = approvedOrPendingExtras.reduce((sum, item) => sum + item.amount, 0);
  const finalTotal = basePrice + extrasTotal;

  return (
    <div className="w-full space-y-6 animate-fade-in pb-12">
      
      {/* NAVIGATION */}
      <div>
        <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors px-1">
          <div className="p-1 rounded-full bg-white border border-gray-200 group-hover:border-gray-300 shadow-sm transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Job
        </button>
      </div>

      {/* HEADER */}
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add Extra Items</h1>
        <p className="text-sm text-gray-500 flex items-center gap-2">
            Job ID: <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">#{job.id.slice(-6).toUpperCase()}</span>
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6">

        {/* LEFT: BILL SUMMARY (Showing Status) */}
        <div className="md:col-span-4 space-y-6 order-2 md:order-2">
           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-gray-400" /> Bill Summary
                  </h3>
              </div>

              <div className="space-y-4 flex-grow">
                  {/* Base Fee */}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                     <div>
                        <p className="text-sm font-bold text-gray-900">Service Fee</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase">Base Rate</p>
                     </div>
                     <p className="text-sm font-bold text-gray-900 flex items-center">
                        <IndianRupee className="w-3 h-3 text-gray-400 mr-0.5" />{basePrice.toFixed(2)}
                     </p>
                  </div>

                  {/* Extras List with Status */}
                  <div className="space-y-2">
                    {(job.extraCharges || []).map((item) => {
                        const isRejected = item.status === 'REJECTED';
                        const isPending = item.status === 'PENDING';
                        const isApproved = item.status === 'APPROVED';

                        return (
                            <div key={item.id} className={`flex justify-between items-center p-3 rounded-xl border ${isRejected ? 'bg-red-50/50 border-red-100 opacity-70' : isApproved ? 'bg-green-50/50 border-green-100' : 'bg-yellow-50/50 border-yellow-100'}`}>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <p className={`text-sm font-semibold ${isRejected ? 'text-gray-500 line-through' : 'text-gray-700'}`}>{item.title}</p>
                                        
                                        {/* Status Badge */}
                                        {isPending && <span className="text-[9px] font-bold bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded flex items-center gap-1"><Clock className="w-3 h-3"/> PENDING</span>}
                                        {isApproved && <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> APPROVED</span>}
                                        {isRejected && <span className="text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded flex items-center gap-1"><Ban className="w-3 h-3"/> REJECTED</span>}
                                    </div>
                                </div>
                                <p className={`text-sm font-bold flex items-center ${isRejected ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                    <IndianRupee className="w-3 h-3 text-gray-400 mr-0.5" />{item.amount.toFixed(2)}
                                </p>
                            </div>
                        );
                    })}

                    {(job.extraCharges || []).length === 0 && (
                        <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
                            <p className="text-xs text-gray-400 italic">No extras added yet.</p>
                        </div>
                    )}
                  </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-end">
                      <p className="text-xs font-bold text-gray-400 uppercase">Total Estimated</p>
                      <p className="text-2xl font-black text-gray-900 flex items-center leading-none">
                         <IndianRupee className="w-5 h-5 text-gray-400 mr-1" />
                         {finalTotal.toFixed(2)}
                      </p>
                  </div>
              </div>
           </div>
        </div>

        {/* RIGHT: INPUT FORM */}
        <div className="md:col-span-8 space-y-6 order-1 md:order-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        <Plus className="w-3.5 h-3.5 text-gray-400" /> New Item Details
                    </h3>
                </div>

                <div className="grid gap-6">
                    {/* Item Name */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Item Description</label>
                        <div className="relative group">
                            <div className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors"><Tag className="w-5 h-5" /></div>
                            <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g. Capacitor, 5m Wire" maxLength={50} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"/>
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Price (INR)</label>
                        <div className="relative group">
                            <div className="absolute left-3.5 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors"><IndianRupee className="w-5 h-5" /></div>
                            <input type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} placeholder="0.00" className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 font-bold tabular-nums focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"/>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide flex justify-between">Proof Photo <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">Required</span></label>
                        {!previewUrl ? (
                            <label className="group flex flex-col items-center justify-center w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform"><Camera className="w-6 h-6 text-gray-400 group-hover:text-blue-600" /></div>
                                    <p className="text-sm font-semibold text-gray-600">Click to upload photo</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        ) : (
                            <div className="relative w-full h-56 rounded-xl overflow-hidden border border-gray-200 shadow-sm group">
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={removeImage} className="p-2 bg-white rounded-full text-red-600 shadow-lg hover:bg-red-50 transform hover:scale-110 transition-all"><X className="w-6 h-6" /></button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button onClick={handleAddItem} disabled={submitting || !itemName || !itemPrice || !proofFile} className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2">
                            {submitting ? "Sending Request..." : <><CheckCircle2 className="w-5 h-5" /> Request Approval</>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Warning Notice */}
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="text-sm font-bold text-gray-900">Wait for Approval</h4>
                    <p className="text-xs text-gray-600 mt-1">Items added here are sent to the customer app instantly. Do not install parts until the status changes to <span className="font-bold text-green-700">APPROVED</span>.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AddExtrasPage;