import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AlertCircle, RefreshCw, ArrowLeft, XCircle, Clock } from 'lucide-react'; 
import type { RootState } from '../../../../store/store';
import { socketService, type BookingConfirmedEvent, type BookingFailedEvent } from '../../../../lib/socketClient';
import { getBookingById, cancelBooking } from '../../api/customerBookingRepository'; 
import { setActiveBooking, clearActiveBooking } from '../../../../store/customerSlice';
import Navbar from '../../../../layouts/customer/Navbar';
import ConfirmModal from '../../../../components/Shared/ConfirmModal/ConfirmModal';  
import { useNotification } from '../../../notifications/hooks/useNotification';

interface LocationState {
    bookingId: string;
}

const SearchingScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { showError } = useNotification();
  
  const state = location.state as LocationState | null;
  const bookingId = state?.bookingId;
  
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [hasFailed, setHasFailed] = useState(false);
  const [failReason, setFailReason] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  
  // ✅ UX: Minimum Loading Time State
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [queuedFailure, setQueuedFailure] = useState<string | null>(null);
  
  // Cancellation State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
 
  useEffect(() => {
      const timer = setTimeout(() => {
          setMinTimeElapsed(true);
      }, 3000); // 3 seconds mandatory wait
      return () => clearTimeout(timer);
  }, []);
 
  useEffect(() => {
      if (minTimeElapsed && queuedFailure) {
          triggerFailureUI(queuedFailure);
      }
  }, [minTimeElapsed, queuedFailure]);
 
  const triggerFailureUI = (reason: string) => {
      setHasFailed(true);
      const message = reason || "We couldn't find a technician for your request at this time.";
      setFailReason(message);
      dispatch(clearActiveBooking());
      
      // FIX: Use showError for failure notifications
      showError(message);
  };
 
  const minTimeRef = useRef(minTimeElapsed);
  useEffect(() => { minTimeRef.current = minTimeElapsed; }, [minTimeElapsed]);

  const handleSystemFailure = (reason: string) => {
      if (minTimeRef.current) {
          triggerFailureUI(reason);
      } else {
          setQueuedFailure(reason);
      }
  };

  useEffect(() => {
    if (!bookingId || !user?.id) {
        navigate('/');
        return;
    }

    const syncInitialStatus = async () => {
        try {
            const booking = await getBookingById(bookingId);
            
            // HYBRID LOGIC: Check if it's a scheduled job
            if (booking.timestamps?.scheduledAt) {
                const now = new Date();
                const sched = new Date(booking.timestamps.scheduledAt);
                const diff = (sched.getTime() - now.getTime()) / (1000 * 60 * 60);
                if (diff >= 2) setIsScheduled(true);
            }
             
            if (['ACCEPTED', 'EN_ROUTE', 'REACHED', 'IN_PROGRESS'].includes(booking.status)) {
                const techSnapshot = booking.snapshots?.technician; 
                const meta = booking.meta;

                dispatch(setActiveBooking({ id: bookingId, status: booking.status }));
                
                navigate(`/booking/${bookingId}/track`, { 
                    state: { technician: {
                        name: techSnapshot?.name || "Technician",
                        vehicle: "",
                        photo: techSnapshot?.avatarUrl,
                        otp: meta?.otp || "----",
                        status: booking.status
                    }} 
                });
            }
            
            // Failure: Use delayed handler with exact reason
            if (booking.status === 'FAILED_ASSIGNMENT') {
                handleSystemFailure("No available technicians found in your area.");
            } else if (booking.status === 'CANCELLED') {
                handleSystemFailure("This booking has been cancelled.");
            }

        } catch (err) {
            console.error("[Searching] Status sync failed", err);
        }
    };
    syncInitialStatus();

    socketService.connect(user.id, "CUSTOMER");

    socketService.onBookingConfirmed((data: BookingConfirmedEvent) => { 
        dispatch(setActiveBooking({ id: bookingId, status: data.status }));
        navigate(`/booking/${bookingId}/track`, { state: { technician: data } }); 
    });

    socketService.onBookingFailed((data: BookingFailedEvent) => {
        // Use the exact reason sent via Socket
        handleSystemFailure(data.reason);
    });

    return () => {
        socketService.offTrackingListeners();
    };
  }, [bookingId, user, navigate, dispatch]);

  const handleCancelSearch = async () => {
      if (!bookingId) return;
      setIsCancelling(true);
      try {
          await cancelBooking(bookingId, "Cancelled by user during search");
          dispatch(clearActiveBooking());
          navigate('/');
      } catch (err) {
          console.error("Cancellation failed", err);
      } finally {
          setIsCancelling(false);
          setIsCancelModalOpen(false);
      }
  };

  if (hasFailed) {
      return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle size={48} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Booking Not Possible</h2>
                
                {/* DISPLAY EXACT REASON */}
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-8 w-full max-w-xs">
                    <p className="text-red-600 text-sm font-semibold">{failReason}</p>
                </div>
                
                <div className="space-y-3 w-full max-w-xs">
                    <button 
                        onClick={() => navigate('/services')} 
                        className="w-full py-3 bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                        <RefreshCw size={18} /> Try Again
                    </button>
                    <button 
                        onClick={() => navigate('/')} 
                        className="w-full py-3 text-gray-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft size={18} /> Go Home
                    </button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                <div className="w-96 h-96 bg-blue-50 rounded-full animate-[ping_3s_ease-in-out_infinite] opacity-50 absolute"></div>
                <div className="w-64 h-64 bg-blue-100 rounded-full animate-[ping_2s_ease-in-out_infinite] opacity-60 absolute"></div>
            </div>
            
            <div className="relative z-10 bg-white p-6 rounded-full shadow-xl mb-10 border-4 border-blue-50 animate-pulse">
                {isScheduled ? (
                    <Clock size={48} className="text-blue-600 mx-auto" />
                ) : (
                    <img src="https://cdn-icons-png.flaticon.com/512/3208/3208728.png" className="w-24 h-24 object-contain opacity-80" alt="Searching" />
                )}
            </div>
            
            {/* HYBRID MESSAGING */}
            <h2 className="relative z-10 text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                {isScheduled ? "Requesting your slot..." : "Finding your expert..."}
            </h2>
            <p className="relative z-10 text-gray-500 max-w-xs leading-relaxed font-medium mb-8">
                {isScheduled 
                    ? "We've sent your request to all available experts. You'll be notified once someone accepts your scheduled time."
                    : "Please wait while we match you with a nearby technician."}
            </p>
            
            <button 
                onClick={() => setIsCancelModalOpen(true)}
                className="relative z-10 flex items-center gap-2 px-6 py-3 bg-white border-2 border-red-100 text-red-600 rounded-full font-bold shadow-sm hover:bg-red-50 transition-all"
            >
                <XCircle size={20} /> Cancel Request
            </button>
        </div>

        <ConfirmModal 
            isOpen={isCancelModalOpen}
            onClose={() => setIsCancelModalOpen(false)}
            onConfirm={handleCancelSearch}
            title="Cancel Search?"
            message="Are you sure you want to stop searching? You won't be charged."
            confirmText="Yes, Cancel"
            isLoading={isCancelling}
        />
    </div>
  );
};

export default SearchingScreen;