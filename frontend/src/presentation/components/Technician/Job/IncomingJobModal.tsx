import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MapPin, IndianRupee,   X } from "lucide-react";
import { type RootState } from "../../../../store/store";
import { clearIncomingJob } from "../../../../store/technicianBookingSlice";
import { respondToBooking } from "../../../../infrastructure/repositories/technician/technicianBookingRepository";
import { useNotification } from "../../../hooks/useNotification";

const IncomingJobModal: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();
  
  const { incomingJob, isModalOpen } = useSelector(
    (state: RootState) => state.technicianBooking
  );

  const [timeLeft, setTimeLeft] = useState(60);
  const [loading, setLoading] = useState(false);

  // 1. Timer Logic
  useEffect(() => {
    if (!isModalOpen || !incomingJob) return;

    const expiryTime = new Date(incomingJob.expiresAt).getTime();
    
    const interval = setInterval(() => {
      const secondsRemaining = Math.round((expiryTime - Date.now()) / 1000);
      setTimeLeft(secondsRemaining);

      if (secondsRemaining <= 0) {
        handleReject("TIMEOUT"); // Auto-reject on timeout
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isModalOpen, incomingJob]);

  // 2. Handle Actions
  const handleAccept = async () => {
    if (!incomingJob) return;
    setLoading(true);
    try {
      await respondToBooking(incomingJob.bookingId, "ACCEPT");
      showSuccess("Job Accepted!");
      dispatch(clearIncomingJob()); 
      
      // Navigate to Active Job Dashboard (Flow C)
      navigate(`/technician/jobs/${incomingJob.bookingId}`); 
      
    } catch  {
      showError("Failed to accept job. It might be expired.");
      dispatch(clearIncomingJob());
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (reason: string = "REJECT") => {
    if (!incomingJob) return;
    // We don't block UI for rejection, just fire and close
    dispatch(clearIncomingJob()); 
    try {
        if (reason !== "TIMEOUT") {
             await respondToBooking(incomingJob.bookingId, "REJECT");
        }
    } catch (err) {
        console.error("Reject failed", err);
    }
  };

  if (!isModalOpen || !incomingJob) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
        
        {/* HEADER: TIMER */}
        <div className="bg-slate-900 p-6 text-center relative overflow-hidden">
            <div className={`absolute top-0 left-0 h-1 bg-yellow-400 transition-all duration-1000 ease-linear`} style={{ width: `${(timeLeft / 60) * 100}%` }} />
            
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1">Incoming Request</p>
            <h2 className="text-4xl font-black text-white tabular-nums tracking-tight">
                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </h2>
        </div>

        {/* BODY: JOB DETAILS */}
        <div className="p-6 space-y-6">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">{incomingJob.serviceName}</h3>
                <p className="text-gray-500 text-sm mt-1">{incomingJob.distance} away from your location</p>
            </div>

            <div className="bg-green-50 rounded-2xl p-4 flex items-center justify-between border border-green-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full text-green-700">
                        <IndianRupee size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-green-800 font-bold uppercase">Est. Earnings</p>
                        <p className="text-xl font-bold text-green-700">₹{incomingJob.earnings}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-green-600 font-medium">Pre-tax</p>
                </div>
            </div>

            <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-xl">
                <MapPin className="text-blue-600 shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-gray-700 font-medium leading-relaxed line-clamp-2">
                    {incomingJob.address}
                </p>
            </div>
        </div>

        {/* FOOTER: ACTIONS */}
        <div className="p-4 grid grid-cols-2 gap-4 bg-gray-50 border-t border-gray-100">
            <button 
                onClick={() => handleReject("REJECT")}
                className="flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-gray-700 bg-white border border-gray-200 shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95"
            >
                <X size={20} />
                Reject
            </button>
            
            <button 
                onClick={handleAccept}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white bg-green-600 shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-wait"
            >
                {loading ? 'Accepting...' : 'Accept Job'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingJobModal;