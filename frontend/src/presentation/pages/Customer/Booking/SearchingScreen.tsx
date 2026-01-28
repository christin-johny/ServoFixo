import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import type { RootState } from '../../../../store/store';
import { socketService, type BookingConfirmedEvent, type BookingFailedEvent } from '../../../../infrastructure/api/socketClient';
import { getBookingById } from '../../../../infrastructure/repositories/customer/customerBookingRepository';
import { setActiveBooking, clearActiveBooking } from '../../../../store/customerSlice';
import Navbar from '../../../../presentation/components/Customer/Layout/Navbar';

interface LocationState {
    bookingId: string;
}

const SearchingScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const state = location.state as LocationState | null;
  const bookingId = state?.bookingId;
  
  const { user } = useSelector((state: RootState) => state.auth);
  const [hasFailed, setHasFailed] = useState(false);
  const [failReason, setFailReason] = useState("");

  useEffect(() => {
    if (!bookingId || !user?.id) {
        navigate('/');
        return;
    }

    const syncInitialStatus = async () => {
        try {
            const booking = await getBookingById(bookingId);
            
            // 1. Success Check
            if (['ACCEPTED', 'EN_ROUTE', 'REACHED', 'IN_PROGRESS'].includes(booking.status)) {
                
                // ✅ FIX: Removed "|| {}" to prevent Type '{}' error
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
            
            // 2. Failure Check
            if (booking.status === 'FAILED_ASSIGNMENT' || booking.status === 'CANCELLED') {
                setHasFailed(true);
                setFailReason("No technicians were available in your area.");
                dispatch(clearActiveBooking());
            }

        } catch (err) {
            console.error("[Searching] Status sync failed", err);
        }
    };
    syncInitialStatus();

    socketService.connect(user.id, "CUSTOMER");

    // Success Listener
    socketService.onBookingConfirmed((data: BookingConfirmedEvent) => { 
        console.log("[Searching] Technician Found via Socket:", data);
        dispatch(setActiveBooking({ id: bookingId, status: data.status }));
        navigate(`/booking/${bookingId}/track`, { state: { technician: data } }); 
    });

    // Failed Listener
    socketService.onBookingFailed((data: BookingFailedEvent) => {
        console.log("Booking Failed:", data);
        setHasFailed(true);
        setFailReason(data.reason);
        dispatch(clearActiveBooking());
    });

    return () => {
        socketService.offTrackingListeners();
    };
  }, [bookingId, user, navigate, dispatch]);

  if (hasFailed) {
      return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle size={48} className="text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Booking Failed</h2>
                <p className="text-gray-500 max-w-xs mb-8">{failReason}</p>
                
                <div className="space-y-3 w-full max-w-xs">
                    <button 
                        onClick={() => navigate('/services')} 
                        className="w-full py-3 bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={18} /> Try Again
                    </button>
                    <button 
                        onClick={() => navigate('/')} 
                        className="w-full py-3 text-gray-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50"
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
            
            <div className="relative z-10 bg-white p-6 rounded-full shadow-xl mb-10 border-4 border-blue-50">
                <img src="https://cdn-icons-png.flaticon.com/512/3208/3208728.png" className="w-24 h-24 object-contain opacity-80" alt="Searching" />
            </div>
            <h2 className="relative z-10 text-2xl font-bold text-gray-900 mb-3 tracking-tight">Finding your expert...</h2>
            <p className="relative z-10 text-gray-500 max-w-xs leading-relaxed font-medium">Please wait while we match you with a nearby technician.</p>
        </div>
    </div>
  );
};

export default SearchingScreen;