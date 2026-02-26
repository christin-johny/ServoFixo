import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useNotification } from "../../../notifications/hooks/useNotification";
import {
  getTechnicianBookingById,
  verifyBookingOtp,
  updateBookingStatus,
  cancelBookingByTechnician
} from "../../api/technicianBookingRepository";
import LoaderFallback from "../../../../components/LoaderFallback";
import ConfirmModal from "../../../../components/Shared/ConfirmModal/ConfirmModal";
import CancellationModal from "../../components/technician/CancellationModal";
import { setActiveJob, updateActiveJobStatus, } from "../../../../store/technicianBookingSlice";
// Components
import { JobHeader } from "../../components/technician/JobHeader";
import { JobFooter } from "../../components/technician/JobFooter";
import { 
  CustomerCard, 
  LocationCard, 
  OtpCard, 
  TimerCard 
} from "../../components/technician/JobCards";
import { 
  socketService, 
  type BookingStatusEvent, 
  type BookingConfirmedEvent,  
  type BookingCancelledEvent   
} from "../../../../lib/socketClient"; 
import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "../../../../store/store";   

// --- Strict Types ---

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export interface JobDetails {
  id: string;
  status: string;
  service: { name: string; categoryId: string };
  customer: { name: string; phone: string; avatarUrl?: string };
  location: { address: string; coordinates: { lat: number; lng: number } };
  pricing: {
      final: number; estimated: number 
};
  snapshots: { 
    customer: { name: string; phone: string }; 
    service: { name: string }; 
  };
  meta?: { instructions?: string };
}

interface ModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  variant: "primary" | "success" | "danger";
  action: () => void;
}

const ActiveJobPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showError, showSuccess } = useNotification();

  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
   
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    isOpen: false, title: "", message: "", confirmText: "Confirm", variant: "primary", action: () => { }
  });

  const { user } = useSelector((state: RootState) => state.auth);
 
  const fetchJob = async () => {
    try {
      if (!id) return;
      const data = await getTechnicianBookingById(id) as JobDetails;
      dispatch(setActiveJob({
          id: data.id,
          status: data.status,
          serviceName: data.snapshots.service.name,
          customerName: data.snapshots.customer.name,
          location: data.location.address
      }));
      
      setJob(data);
 
      if (data.status === 'COMPLETED') {
        navigate(`/technician/jobs/${id}/complete`, { replace: true });
        return;
      }
 
      const historyStatuses = ["PAID", "CANCELLED", "REJECTED", "FAILED_ASSIGNMENT", "TIMEOUT", "CANCELLED_BY_TECH"];
      if (historyStatuses.includes(data.status)) {
         navigate(`/technician/jobs/${id}/details`, { replace: true });
         return;
      }
      
    } catch { 
      showError("Failed to load job details."); 
      navigate("/technician/dashboard");
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchJob(); }, [id]);

  useEffect(() => {
    if (!id || !user?.id) return;

    socketService.connect(user.id, "TECHNICIAN");

    //   Typed Handlers
    const handleStatusUpdate = (data: BookingStatusEvent) => { 
    if (data.bookingId === id) { 
        dispatch(updateActiveJobStatus(data.status)); // Update Redux instantly
        fetchJob();
    }
};

    const handleConfirm = (data: BookingConfirmedEvent) => {
        if (data.bookingId === id) fetchJob();
    };

    const handleCancel = (data: BookingCancelledEvent) => {
        if (data.bookingId === id) fetchJob();
    };

    // Listeners
    socketService.onBookingStatusUpdate(handleStatusUpdate);
    socketService.onBookingConfirmed(handleConfirm);
    socketService.onBookingCancelled(handleCancel);

    return () => {
        socketService.offTrackingListeners();
    };
  }, [id, user?.id]);

  // --- Actions ---
  const executeStatusUpdate = async (status: string) => {
    if (!job) return;
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    setActionLoading(true);
    try {
      await updateBookingStatus(job.id, status);
      showSuccess("Status Updated");
      fetchJob();
    } catch { 
      showError("Failed to update status."); 
    } finally { 
      setActionLoading(false); 
    }
  };

  const executeStartJob = async () => {
    const code = otp.join("");
    if (code.length !== 4) return showError("Enter complete OTP.");
    
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    setActionLoading(true);
    try {
      if (!job) return;
      await verifyBookingOtp(job.id, code);
      showSuccess("Job Started!");
      fetchJob();
    } catch (err: unknown) {
      const error = err as ApiError;
      const msg = error.response?.data?.message || "Invalid OTP";
      showError(msg);
      setOtp(["", "", "", ""]);
    } finally { 
      setActionLoading(false); 
    }
  };

  const handleCancelJob = async (reason: string) => {
    if (!job) return;
    setActionLoading(true);
    try {
      await cancelBookingByTechnician(job.id, reason);
      showSuccess("Job cancelled");
      navigate("/technician/dashboard");
    } catch (err: unknown) {
      const error = err as ApiError;
      const msg = error.response?.data?.message || "Failed to cancel job";
      showError(msg);
      setIsCancelModalOpen(false);
    } finally { 
      setActionLoading(false); 
    }
  };

  // --- UI Handlers ---
  const triggers = {
    enRoute: () => setModalConfig({
      isOpen: true, title: "Start Travel?", message: "Notify customer you are en route?", confirmText: "Yes, Leaving", variant: "primary", action: () => executeStatusUpdate("EN_ROUTE")
    }),
    reached: () => setModalConfig({
      isOpen: true, title: "Arrived?", message: "Confirm arrival at location.", confirmText: "Yes, Here", variant: "primary", action: () => executeStatusUpdate("REACHED")
    }),
    start: () => setModalConfig({
      isOpen: true, title: "Start Service", message: "Verify problem and start timer?", confirmText: "Verify & Start", variant: "success", action: executeStartJob
    })
  };

  if (loading) return <LoaderFallback />;
  if (!job) return null;

  const isWorking = job.status === "IN_PROGRESS";

  return (
    <div className="w-full min-h-screen space-y-6 animate-fade-in pb-32 md:pb-12 font-sans relative rounded-[20px] ">
      
      {/* --- 1. NAVIGATION & HEADER --- */}
      <div className="space-y-4 pt-2 px-4 md:px-8">
        <div>
            <button
                onClick={() => navigate("/technician/dashboard")}
                className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors px-1"
            >
                <div className="p-1 rounded-full bg-white border border-gray-200 group-hover:border-gray-300 shadow-sm transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                Back to Dashboard
            </button>
        </div>

        <div className="flex flex-col gap-1 px-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Active Job
            </h1>
            <p className="text-sm text-gray-500">
                Manage service execution and details.
            </p>
        </div>
      </div>

      {/* --- 2. MAIN CONTENT GRID --- */}
      <div className="px-4 md:px-8">
        <div className="grid md:grid-cols-12 gap-6">
          
          {/* MAIN COLUMN (8 cols) */}
          <div className="md:col-span-8 space-y-6">
             <JobHeader 
                job={job} 
                onCancel={() => setIsCancelModalOpen(true)} 
             />

             {(job.status === "REACHED" || isWorking) && (
               <div className="animate-fade-in-up">
                  {job.status === "REACHED" && <OtpCard otp={otp} setOtp={setOtp} />}
                  {isWorking && <TimerCard />}
               </div>
             )}
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomerCard job={job} />
                <LocationCard job={job} isWorking={isWorking} />
             </div>
          </div>

          {/* SIDE COLUMN (4 cols) */}
          <div className="md:col-span-4 space-y-6">
              <div className="hidden md:block bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                 <h4 className="font-bold text-blue-900 mb-2">Technician Guide</h4>
                 <ul className="text-sm text-blue-800/80 space-y-2 list-disc pl-4">
                    <li>Verify customer identity before starting.</li>
                    <li>Ensure OTP is entered correctly.</li>
                    <li>Add extra parts using the 'Extras' tab below.</li>
                    <li>Take photos of work before closing the job.</li>
                 </ul>
              </div>
          </div>

        </div>
      </div>

      {/* --- 3. FOOTER (Fixed Bottom) --- */}
      <JobFooter 
        status={job.status} 
        loading={actionLoading}
        onEnRoute={triggers.enRoute}
        onReached={triggers.reached}
        onStart={triggers.start}
        onExtras={() => navigate(`/technician/jobs/${id}/extras`)}
        onComplete={() => navigate(`/technician/jobs/${id}/complete`)}
      />

      {/* --- MODALS --- */}
      <ConfirmModal 
        isOpen={modalConfig.isOpen} onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} 
        onConfirm={modalConfig.action} title={modalConfig.title} message={modalConfig.message} 
        confirmText={modalConfig.confirmText} variant={modalConfig.variant} 
      />
      
      <CancellationModal 
        isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} 
        onConfirm={handleCancelJob} isLoading={actionLoading} 
      />
    </div>
  );
};

export default ActiveJobPage;



