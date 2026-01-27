import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store/store';
// UPDATE: Use the shared socket client
import { socketService, type BookingConfirmedEvent } from '../../../../infrastructure/api/socketClient';
import Navbar from '../../../../presentation/components/Customer/Layout/Navbar';

interface LocationState {
    bookingId: string;
}

const SearchingScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const bookingId = state?.bookingId;
  
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Guard Clause: Redirect if accessed without context
    if (!bookingId || !user?.id) {
        navigate('/');
        return;
    }

    // 1. Connect Socket as CUSTOMER
    socketService.connect(user.id, "CUSTOMER");

    // 2. Listen for Flow B Success (Technician Assigned)
    const handleConfirmation = (data: BookingConfirmedEvent) => { 
        
        alert(`Technician Assigned! ${data.techName} is coming.`);
        // Navigate to the Tracking Page or Profile
        navigate('/profile'); 
    };

    socketService.onBookingConfirmed(handleConfirmation);

    // Cleanup: Disconnect on unmount
    return () => {
        socketService.disconnect();
    };
  }, [bookingId, user, navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            
            {/* RADAR ANIMATION */}
            <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                <div className="w-96 h-96 bg-blue-50 rounded-full animate-[ping_3s_ease-in-out_infinite] opacity-50 absolute"></div>
                <div className="w-64 h-64 bg-blue-100 rounded-full animate-[ping_2s_ease-in-out_infinite] opacity-60 absolute"></div>
                <div className="w-32 h-32 bg-blue-200 rounded-full animate-pulse opacity-80 absolute"></div>
            </div>

            <div className="relative z-10 bg-white p-6 rounded-full shadow-xl mb-10 border-4 border-blue-50">
                <img 
                    src="https://cdn-icons-png.flaticon.com/512/3208/3208728.png" 
                    className="w-24 h-24 object-contain opacity-80" 
                    alt="Searching" 
                />
            </div>

            <h2 className="relative z-10 text-2xl font-bold text-gray-900 mb-3">Finding your expert...</h2>
            <p className="relative z-10 text-gray-500 max-w-xs leading-relaxed">
                We are contacting top-rated technicians in your zone. Please wait while they accept your request.
            </p>

            <p className="mt-8 text-xs text-gray-300 relative z-10 font-mono">
                ID: {bookingId}
            </p>

            <div className="relative z-10 mt-12 w-full max-w-xs">
                <button className="w-full py-3.5 text-red-500 font-bold border-2 border-red-50 rounded-xl hover:bg-red-50 transition-colors">
                    Cancel Request
                </button>
            </div>
        </div>
    </div>
  );
};

export default SearchingScreen;