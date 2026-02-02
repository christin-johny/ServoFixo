import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
    CheckCircle2, 
    AlertTriangle,  
    MapPin, 
    FileText, 
    ChevronRight,
    ShieldCheck,
    Truck,
    Wrench,
    Check,
    XCircle, 
} from 'lucide-react';

import type { RootState } from '../../../../store/store';
import { 
    socketService,  
    type BookingConfirmedEvent 
} from '../../../../infrastructure/api/socketClient';
import { 
    getBookingById, 
    cancelBooking,
    respondToExtraCharge, 
    type BookingResponse 
} from '../../../../infrastructure/repositories/customer/customerBookingRepository';
import {  
    setActiveBooking, 
    clearActiveBooking, 
} from '../../../../store/customerSlice';
import { type ExtraCharge } from '../../../../../../shared/types/value-objects/BookingTypes';

import Navbar from '../../../../presentation/components/Customer/Layout/Navbar';
import ConfirmModal from '../../../components/Shared/ConfirmModal/ConfirmModal';
import { useNotification } from '../../../hooks/useNotification';

interface ExtendedBookingResponse extends BookingResponse {
    location?: {
        address: string;
        coordinates: { lat: number; lng: number };
    };
    pricing?: {
        estimated: number;
        deliveryFee: number;
        discount: number;
        tax: number;
        final?: number;
    };
    snapshots?: {
        technician?: {
            name: string;
            phone: string;
            avatarUrl?: string;
            rating?: number; 
            vehicle?: string; 
        };
        service?: {
            name: string;
            categoryId: string;
        };
    };
    extraCharges?: ExtraCharge[];
}

interface ExtraChargeRequest {
  itemId: string;
  title: string;
  amount: number;
  proofUrl?: string;
}

interface StepperStep {
    key: string;
    label: string;
    icon: React.ElementType;
}

interface LocationState {
    technician?: BookingConfirmedEvent;
}

const STEPS: StepperStep[] = [
    { key: 'ACCEPTED', label: 'Order Confirmed', icon: FileText },
    { key: 'EN_ROUTE', label: 'Technician En Route', icon: Truck },
    { key: 'REACHED', label: 'Arrived at Location', icon: MapPin },
    { key: 'IN_PROGRESS', label: 'Work in Progress', icon: Wrench },
    { key: 'EXTRAS_PENDING', label: 'Action Required', icon: AlertTriangle },
    { key: 'COMPLETED', label: 'Job Completed', icon: CheckCircle2 },
];

const BookingTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
   
  const { showError } = useNotification();
  const { user } = useSelector((state: RootState) => state.auth); 
  const { activeTechnician } = useSelector((state: RootState) => state.customer);
 
  const [bookingData, setBookingData] = useState<ExtendedBookingResponse | null>(null);
   
  const [status, setStatus] = useState<string>(() => {
      const state = location.state as LocationState | null;
      return state?.technician?.status || "ACCEPTED";
  });
  
  const [extraRequest, setExtraRequest] = useState<ExtraChargeRequest | null>(null);
  const [billTotal, setBillTotal] = useState<number | null>(null);
 
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isProcessingExtra, setIsProcessingExtra] = useState(false);
 
  // ✅ SMART SYNC: Retries if price is missing for completed jobs
  const syncBookingData = async (retryCount = 0) => {
      if (!id) return;
      try {
          const data = await getBookingById(id) as ExtendedBookingResponse;
          
          setBookingData(data);
          setStatus(data.status);
          dispatch(setActiveBooking({ id: data.id, status: data.status }));
 
          // --- LOGIC FOR BILL TOTAL ---
          if (data.status === 'COMPLETED') {
             // Case A: Price is ready -> Show Modal
             if (data.pricing?.final) {
                 console.log("✅ Price found:", data.pricing.final);
                 setBillTotal(data.pricing.final);
             } 
             // Case B: Job is done, but Price is missing -> RETRY AUTOMATICALLY
             else if (retryCount < 5) {
                 console.log("⏳ Job completed but price missing. Retrying in 1s...");
                 setTimeout(() => syncBookingData(retryCount + 1), 1000);
             }
          } else {
             // Hide modal if status is IN_PROGRESS or EXTRAS_PENDING
             setBillTotal(null); 
          }

          if (data.extraCharges) {
             const pending = data.extraCharges.find(c => c.status === 'PENDING');
             if (pending) {
                setExtraRequest({
                  itemId: pending.id,
                  title: pending.title,
                  amount: pending.amount,
                  proofUrl: pending.proofUrl
                });
             } else {
                setExtraRequest(null);
             }
          }
      } catch (err) {
          console.error("Sync failed", err);
      }
  };

  useEffect(() => {
    if (!user?.id || !id) return;

    syncBookingData();
    socketService.connect(user.id, "CUSTOMER");

    // --- SOCKET LISTENERS ---

    // 1. Status Update Listener
    socketService.onBookingStatusUpdate((data) => {
        console.log("📩 Socket Status Update:", data.status);
        if (data.status === 'COMPLETED') {
            setStatus('COMPLETED');
            syncBookingData(); 
        } else {
            syncBookingData();
        }
    });

    // 2. Extra Charge Listener
    socketService.onApprovalRequest((data) => {
        setExtraRequest({
            itemId: data.extraItem.id,
            title: data.extraItem.title,
            amount: data.extraItem.amount,
            proofUrl: data.extraItem.proofUrl
        });
    });

    // 3. Payment Request Listener (Direct Trigger)
    socketService.onPaymentRequest((data) => {
        console.log("💰 Payment Request Event:", data);
        setStatus('COMPLETED');
        setBillTotal(data.totalAmount); 
    });
 
    socketService.onChargeUpdate(() => {
        syncBookingData();
    });

    return () => {
        socketService.offTrackingListeners();
    };
  }, [id, user]);

  const handleApproveExtra = async (approved: boolean) => {
      if (!id || !extraRequest) return;
      
      setIsProcessingExtra(true);
      try {
          await respondToExtraCharge(id, extraRequest.itemId, approved ? "APPROVE" : "REJECT");
          
          if (bookingData && bookingData.extraCharges) {
              const updatedCharges = bookingData.extraCharges.map(c => 
                  c.id === extraRequest.itemId 
                  ? { ...c, status: approved ? "APPROVED" : "REJECTED" } as ExtraCharge
                  : c
              );
              setBookingData({ ...bookingData, extraCharges: updatedCharges });
          }

          setExtraRequest(null);
      } catch  {
          showError("Failed to process request. Please try again.");
      } finally {
          setIsProcessingExtra(false);
      }
  };

  const handlePayNow = () => {
      if (id) {
          navigate(`/booking/${id}/payment`, { state: { amount: billTotal }});
      }
  };

  const handleCancelBooking = async () => {
      if (!id) return;
      setIsCancelling(true);
      try {
          await cancelBooking(id, "Cancelled by user via Tracking Page");
          dispatch(clearActiveBooking());
          navigate('/');
      } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Cancellation failed";
          showError(msg);
      } finally {
          setIsCancelling(false);
          setIsCancelModalOpen(false);
      }
  };

  const canCancel = !['EXTRAS_PENDING', 'COMPLETED', 'PAID', 'CANCELLED','IN_PROGRESS'].includes(status);
  
  const navState = location.state as LocationState | null;
  const snapshotTech = bookingData?.snapshots?.technician;
  const navTech = navState?.technician;

  const displayTech = {
      name: snapshotTech?.name || activeTechnician?.name || navTech?.techName || "Technician Assigned",
      photo: snapshotTech?.avatarUrl || activeTechnician?.photo || navTech?.photoUrl, 
      vehicle: snapshotTech?.vehicle || activeTechnician?.vehicle || navTech?.vehicleNumber || "",
      rating: snapshotTech?.rating || 4.8,
      phone: snapshotTech?.phone || activeTechnician?.phone || ""
  };

  const serviceName = bookingData?.snapshots?.service?.name || "Service Request";
  const address = bookingData?.location?.address || "Loading location...";
  const pricing = bookingData?.pricing || { estimated: 0, deliveryFee: 0 };
  const otp = bookingData?.meta?.otp || activeTechnician?.otp || navTech?.otp || "----";

  const approvedExtrasTotal = bookingData?.extraCharges
      ?.filter(c => c.status === 'APPROVED')
      .reduce((sum, c) => sum + c.amount, 0) || 0;

  const finalTotal = (pricing.estimated || 0) + (pricing.deliveryFee || 0) + approvedExtrasTotal;

  const currentStepIndex = STEPS.findIndex(s => s.key === status);
  const activeIndex = currentStepIndex === -1 
        ? (status === 'PAID' ? 5 : (status === 'EXTRAS_PENDING' ? 4 : 0)) 
        : currentStepIndex;

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">
                    Booking #{id?.slice(-6).toUpperCase()}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Track the live progress of your service
                </p>
            </div>
            
            <div className="flex items-center gap-3 self-start md:self-auto">
               {canCancel && (
                   <button 
                       onClick={() => setIsCancelModalOpen(true)}
                       className="px-4 py-2 rounded-full text-sm font-bold border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                   >
                       <XCircle size={16} /> Cancel
                   </button>
               )}

               <span className={`px-4 py-2 rounded-full text-sm font-bold border flex items-center gap-2 ${
                   status === 'COMPLETED' || status === 'PAID'
                   ? 'bg-green-50 text-green-700 border-green-200' 
                   : (status === 'EXTRAS_PENDING' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200')
               }`}>
                  <span className="relative flex h-2.5 w-2.5">
                    {(status !== 'COMPLETED' && status !== 'PAID') && (
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            status === 'EXTRAS_PENDING' ? 'bg-orange-400' : 'bg-blue-400'
                        }`}></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        (status === 'COMPLETED' || status === 'PAID') ? 'bg-green-500' : (status === 'EXTRAS_PENDING' ? 'bg-orange-500' : 'bg-blue-500')
                    }`}></span>
                  </span>
                  {status === 'EXTRAS_PENDING' ? 'Action Required' : status.replace("_", " ")}
               </span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {/* Stepper */}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900 mb-8">Live Status</h2>
                    <div className="relative">
                        <div className="hidden md:block absolute top-5 left-0 w-full h-1 bg-gray-100 rounded-full -z-10" />
                        <div 
                            className="hidden md:block absolute top-5 left-0 h-1 bg-blue-600 rounded-full transition-all duration-700 -z-10"
                            style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
                        />
                        <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-0">
                            {STEPS.map((step, idx) => {
                                const isCompleted = idx < activeIndex;
                                const isActive = idx === activeIndex;
                                const Icon = step.icon;

                                return (
                                    <div key={step.key} className="flex md:flex-col items-center gap-4 md:gap-3">
                                        <div className={`
                                            w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 z-10
                                            ${isActive 
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-110' 
                                                : isCompleted 
                                                    ? 'bg-blue-600 border-blue-600 text-white' 
                                                    : 'bg-white border-gray-200 text-gray-300'
                                            }
                                        `}>
                                            {isCompleted ? <Check size={20} strokeWidth={3} /> : <Icon size={20} />}
                                        </div>
                                        <div className={`md:text-center ${isActive ? 'opacity-100' : 'opacity-60 md:opacity-100'}`}>
                                            <p className={`text-sm font-bold ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>{step.label}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Technician Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <img 
                                    src={displayTech.photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                                    alt={displayTech.name} 
                                    className="w-16 h-16 rounded-full object-cover border-4 border-gray-50 shadow-sm"
                                />
                                <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white w-4 h-4 rounded-full"></div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{displayTech.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold text-blue-700 uppercase tracking-wide border border-blue-100">
                                        <ShieldCheck size={10} /> Verified Partner
                                    </div>
                                    {displayTech.vehicle && (
                                        <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
                                            {displayTech.vehicle}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {['ACCEPTED', 'EN_ROUTE', 'REACHED', 'IN_PROGRESS'].includes(status) && (
                        <div className="mt-6 bg-blue-600 rounded-xl p-4 flex items-center justify-between text-white shadow-lg shadow-blue-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-blue-100 tracking-wider">Start Code</p>
                                    <p className="text-xs text-blue-50 opacity-90">Share with technician</p>
                                </div>
                            </div>
                            <div className="text-3xl font-mono font-bold tracking-[0.15em]">{otp}</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Billing & Extras List */}
            <div className="space-y-6">
                {/* Service Details */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Service Details</h3>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                            <Wrench size={22} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-base">{serviceName}</p>
                            <p className="text-xs text-gray-500 mt-1">Standard Service</p>
                        </div>
                    </div>
                    
                    <div className="my-4 h-px bg-gray-100" />
                    
                    <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-gray-400 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-gray-900 mb-0.5">Service Location</p>
                            <p className="text-xs text-gray-500 leading-relaxed">{address}</p>
                        </div>
                    </div>
                </div>

                {/* Billing Estimate */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Billing Estimate</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Service Charge</span>
                            <span className="font-medium">₹{pricing.estimated}</span>
                        </div>
                        {pricing.deliveryFee > 0 && (
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Convenience Fee</span>
                                <span className="font-medium">₹{pricing.deliveryFee}</span>
                            </div>
                        )}

                        {bookingData?.extraCharges && bookingData.extraCharges.length > 0 && (
                            <div className="py-2 border-y border-dashed border-gray-200 my-2 space-y-2">
                                <p className="text-xs font-bold text-gray-400 uppercase">Extras Added</p>
                                {bookingData.extraCharges.map((extra) => (
                                    <div key={extra.id} className="flex justify-between text-sm items-center">
                                        <div className="flex items-center gap-2">
                                            {extra.status === 'APPROVED' && <CheckCircle2 size={12} className="text-green-500" />}
                                            {extra.status === 'REJECTED' && <XCircle size={12} className="text-red-500" />}
                                            {extra.status === 'PENDING' && <AlertTriangle size={12} className="text-orange-500 animate-pulse" />}
                                            <span className={`${extra.status === 'REJECTED' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                                {extra.title}
                                            </span>
                                        </div>
                                        <span className={`font-medium ${extra.status === 'REJECTED' ? 'text-gray-300' : 'text-gray-900'}`}>
                                            ₹{extra.amount}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="h-px bg-gray-100 my-2" />
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-900">Total Estimate</span>
                            <span className="text-xl font-bold text-blue-600">
                                ₹{finalTotal}
                            </span>
                        </div>
                    </div>
                    {status === 'EXTRAS_PENDING' && (
                         <div className="mt-4 flex items-center gap-2 bg-orange-50 text-orange-800 text-xs font-bold p-3 rounded-lg border border-orange-100">
                            <AlertTriangle size={16} className="shrink-0" />
                            <p>Action Required: Review pending items.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <ConfirmModal 
            isOpen={isCancelModalOpen}
            onClose={() => setIsCancelModalOpen(false)}
            onConfirm={handleCancelBooking}
            title="Cancel Booking?"
            message="Are you sure you want to cancel?"
            confirmText="Yes, Cancel Booking"
            isLoading={isCancelling}
        />

        {/* Extra Charge Modal */}
        {extraRequest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-4 border border-gray-200">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">Additional Charge Request</h3>
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                        The technician has requested to add an item to your bill.
                    </p>

                    <div className="bg-gray-50 p-4 rounded-xl my-6 border border-gray-200">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Item Details</p>
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-gray-900">{extraRequest.title}</p>
                            <p className="text-xl font-black text-gray-900">₹{extraRequest.amount}</p>
                        </div>
                        {extraRequest.proofUrl && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <a href={extraRequest.proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                                    <FileText size={12} /> View Proof Document
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => handleApproveExtra(false)} 
                            disabled={isProcessingExtra}
                            className="py-3.5 font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {isProcessingExtra ? "Wait..." : "Decline"}
                        </button>
                        <button 
                            onClick={() => handleApproveExtra(true)} 
                            disabled={isProcessingExtra}
                            className="py-3.5 font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors shadow-lg shadow-green-200 disabled:opacity-50"
                        >
                            {isProcessingExtra ? "Approving..." : "Approve"}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Payment Modal */}
        {billTotal !== null && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
                <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden animate-in zoom-in-95">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">Job Completed!</h2>
                    <p className="text-gray-500 text-sm mt-2">The technician has successfully finished the work.</p>
                    
                    <div className="my-8 py-6 border-y border-dashed border-gray-200 bg-gray-50/50 -mx-8">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Amount Due</p>
                        <p className="text-5xl font-black text-gray-900 tracking-tighter">₹{billTotal}</p>
                    </div>
                    
                    <button 
                        onClick={handlePayNow} 
                        className="w-full py-4 bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xl hover:bg-gray-800 transition-transform active:scale-[0.98]"
                    >
                        PAY SECURELY <ChevronRight size={18} />
                    </button>
                </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default BookingTrackingPage;