import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  MapPin, Phone, User, Navigation, ShieldCheck, Clock, 
  ChevronRight, Bike, Map as MapIcon, PlusCircle, AlertCircle,
  CreditCard, Calendar
} from "lucide-react";
import { useNotification } from "../../../hooks/useNotification";
import { 
  getTechnicianBookingById, verifyBookingOtp, updateBookingStatus 
} from "../../../../infrastructure/repositories/technician/technicianBookingRepository";
import LoaderFallback from "../../../components/LoaderFallback";
import ConfirmModal from "../../../components/Shared/ConfirmModal/ConfirmModal";

interface JobDetails {
  id: string;
  status: string;
  service: { name: string; categoryId: string };
  customer: { name: string; phone: string; avatarUrl?: string };
  location: { address: string; coordinates: { lat: number; lng: number } };
  pricing: { estimated: number };
  snapshots: {
    customer: { name: string; phone: string };
    service: { name: string };
  };
  meta?: { instructions?: string };
}

const ActiveJobPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showError, showSuccess } = useNotification();
  
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);

  // --- MODAL CONFIG ---
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    variant: "primary" | "success" | "danger";
    action: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    variant: "primary",
    action: () => {},
  });

  // --- INITIAL DATA FETCH ---
  const fetchJob = async () => {
    try {
      if (!id) return;
      const data = await getTechnicianBookingById(id);
      setJob(data);
    } catch (err) { 
      console.error(err);
      showError("Failed to load job details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  // --- ACTIONS ---
  const executeStatusUpdate = async (newStatus: string) => {
    if (!job) return;
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    setActionLoading(true);
    try {
      await updateBookingStatus(job.id, newStatus);
      showSuccess(newStatus === 'EN_ROUTE' ? "Status: On the Way!" : "Status: Reached Location");
      fetchJob(); 
    } catch (err) {
      console.error(err);
      showError("Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const executeStartJob = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 4) {
      showError("Please enter the complete 4-digit OTP.");
      return;
    }
    
    setModalConfig(prev => ({ ...prev, isOpen: false }));
    setActionLoading(true);
    try {
      if (!job) return;
      await verifyBookingOtp(job.id, otpCode);
      showSuccess("OTP Verified! Job Started.");
      fetchJob(); 
    } catch (err: unknown) {
  let msg = "Invalid OTP. Please ask the customer again.";

  if (
    err instanceof Error &&
    typeof (err as Error & { response?: unknown }).response === "object" &&
    (err as Error & { response?: unknown }).response !== null
  ) {
    const response = (err as Error & { response: { data?: unknown } }).response;

    if (
      typeof response.data === "object" &&
      response.data !== null &&
      "message" in response.data &&
      typeof response.data.message === "string"
    ) {
      msg = response.data.message;
    }
  }

  showError(msg);
  setOtp(["", "", "", ""]);
}  finally {
      setActionLoading(false);
    }
  };

  // --- MODAL TRIGGERS ---
  const handleEnRouteClick = () => {
    setModalConfig({
      isOpen: true,
      title: "Start Travel?",
      message: "This will notify the customer that you are on your way.",
      confirmText: "Start Travel",
      variant: "primary",
      action: () => executeStatusUpdate("EN_ROUTE")
    });
  };

  const handleReachedClick = () => {
    setModalConfig({
      isOpen: true,
      title: "Confirm Arrival",
      message: "Have you reached the customer's location?",
      confirmText: "Yes, I'm Here",
      variant: "primary",
      action: () => executeStatusUpdate("REACHED")
    });
  };

  const handleStartJobClick = () => {
    setModalConfig({
      isOpen: true,
      title: "Start Service",
      message: "Ensure you have verified the problem before starting the timer.",
      confirmText: "Verify OTP & Start",
      variant: "success",
      action: () => executeStartJob()
    });
  };

  // --- HELPERS ---
  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const openGoogleMaps = () => {
    if (!job?.location?.coordinates) return;
    const { lat, lng } = job.location.coordinates;
    window.open(`http://maps.google.com/?q=${lat},${lng}`, '_blank');
  };

  if (loading) return <LoaderFallback />;
  if (!job) return null;

  const customerName = job.snapshots?.customer?.name || job.customer?.name || "Customer";
  const customerPhone = job.snapshots?.customer?.phone || job.customer?.phone;
  const isWorking = job.status === "IN_PROGRESS";
  
  // Status Color Logic
  const getStatusColor = (status: string) => {
    switch (status) {
        case 'ACCEPTED': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'EN_ROUTE': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
        case 'REACHED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'IN_PROGRESS': return 'bg-green-100 text-green-700 border-green-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] relative flex flex-col font-sans"> 
      
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.action}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        variant={modalConfig.variant}
      />

      <div className="flex-1 pb-48"> 
        
        {/* --- INDUSTRIAL HEADER --- */}
        <div className="bg-white shadow-sm border-b border-gray-200 z-10 relative">
            <div className="max-w-5xl mx-auto px-5 pt-6 pb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase border ${getStatusColor(job.status)}`}>
                                {job.status.replace("_", " ")}
                            </span>
                            <span className="text-xs text-gray-400 font-mono tracking-wide">#{job.id.slice(-6).toUpperCase()}</span>
                        </div>
                        <h1 className="text-xl font-extrabold text-gray-900 leading-tight tracking-tight">{job.snapshots.service.name || job.service.name}</h1>
                    </div>
                    <div className="text-right bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                        <div className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-0.5">Earnings</div>
                        <div className="text-lg font-black text-green-700 leading-none">₹{job.pricing.estimated}</div>
                    </div>
                </div>

                {/* Progress Tracker */}
                <div className="flex items-center gap-1 mt-6">
                    {['ACCEPTED', 'EN_ROUTE', 'REACHED', 'IN_PROGRESS'].map((step, idx) => {
                        const activeSteps = ['ACCEPTED', 'EN_ROUTE', 'REACHED', 'IN_PROGRESS', 'COMPLETED'];
                        const isActive = activeSteps.indexOf(job.status) >= idx;
                        const isCurrent = job.status === step;
                        
                        return (
                        <div key={step} className="flex-1">
                             <div className={`h-1.5 rounded-full transition-all duration-500 ${isActive ? (step === 'IN_PROGRESS' ? 'bg-green-500' : 'bg-blue-600') : 'bg-gray-200'} ${isCurrent ? 'ring-2 ring-offset-1 ring-blue-100' : ''}`} />
                             <div className={`mt-2 text-[9px] font-bold uppercase tracking-wider text-center ${isActive ? 'text-gray-900' : 'text-gray-300'}`}>
                                {step.replace("_", " ")}
                             </div>
                        </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* --- ADAPTIVE GRID LAYOUT --- */}
        <div className="max-w-5xl mx-auto px-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* 1. CUSTOMER CARD */}
                <div className="bg-white p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between h-full">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 text-gray-400">
                                <User className="w-6 h-6"/>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">CUSTOMER</p>
                                <p className="font-bold text-gray-900 text-base">{customerName}</p>
                            </div>
                        </div>
                        <a 
                            href={`tel:${customerPhone}`} 
                            className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                        >
                            <Phone className="w-5 h-5"/>
                        </a>
                    </div>
                    
                    <div className="mt-5 pt-4 border-t border-gray-50 flex gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400"/> 
                            <span>Today</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-gray-400"/> 
                            <span>Cash / Online</span>
                        </div>
                    </div>
                </div>

                {/* 2. LOCATION CARD */}
                <div className="bg-white p-5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col h-full">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="mt-1">
                             <MapPin className="w-5 h-5 text-red-500"/>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">LOCATION</p>
                            <p className="text-sm text-gray-700 font-medium leading-relaxed">{job.location.address}</p>
                        </div>
                    </div>

                    {job.meta?.instructions && (
                        <div className="bg-yellow-50/50 p-3 rounded-lg flex gap-2.5 items-start border border-yellow-100 mb-4">
                            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0"/>
                            <p className="text-xs text-yellow-800 font-medium leading-relaxed">"{job.meta.instructions}"</p>
                        </div>
                    )}

                    <div className="mt-auto">
                        {!isWorking && (
                        <button 
                            onClick={openGoogleMaps}
                            className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all active:scale-[0.98] border border-gray-200 shadow-sm"
                        >
                            <Navigation className="w-4 h-4 text-gray-500"/> Navigate
                        </button>
                        )}
                    </div>
                </div>

                {/* 3. OTP / ACTION CARD (Conditional) */}
                {job.status === "REACHED" && (
                    <div className="md:col-span-2 bg-white rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.1)] border border-blue-100 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full opacity-50"/>
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                        <ShieldCheck className="w-6 h-6"/>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Security Verification</h2>
                                        <p className="text-sm text-gray-500">Ask the customer for the 4-digit PIN to start.</p>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            id={`otp-${idx}`}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            className="w-12 h-14 rounded-lg border-2 border-gray-200 text-center text-2xl font-bold text-gray-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all shadow-sm"
                                            placeholder="•"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* 4. ACTIVE TIMER CARD */}
                {isWorking && (
                    <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-green-100 p-6 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-green-50/30 pattern-dots opacity-50"/>
                        <div className="relative flex flex-col items-center animate-in fade-in zoom-in duration-500">
                            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 animate-pulse">
                                <Clock className="w-7 h-7"/>
                            </div>
                            <h3 className="text-lg font-bold text-green-800">Job in Progress</h3>
                            <p className="text-green-600 text-sm font-medium">Timer is running accurately.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* --- STICKY FOOTER ACTIONS --- */}
      <div className="fixed bottom-[64px] md:bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-[40] md:pl-64 transition-all duration-300"> 
        <div className="max-w-3xl mx-auto">
            
            {/* 1. ACCEPTED -> EN ROUTE */}
            {job.status === "ACCEPTED" && (
                <button 
                onClick={handleEnRouteClick}
                disabled={actionLoading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
                >
                {actionLoading ? <span className="animate-pulse">Starting...</span> : (
                    <> <Bike className="w-6 h-6 group-hover:translate-x-1 transition-transform" /> Slide to Start Travel <ChevronRight className="w-5 h-5 opacity-70"/> </>
                )}
                </button>
            )}

            {/* 2. EN_ROUTE -> REACHED */}
            {job.status === "EN_ROUTE" && (
                <button 
                onClick={handleReachedClick}
                disabled={actionLoading}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                {actionLoading ? 'Updating...' : (
                    <><MapIcon className="w-5 h-5"/> Confirm Arrival at Location</>
                )}
                </button>
            )}

            {/* 3. REACHED -> VERIFY OTP */}
            {job.status === "REACHED" && (
                <button 
                    onClick={handleStartJobClick}
                    disabled={actionLoading}
                    className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    {actionLoading ? 'Verifying...' : <>Verify & Start Job <ChevronRight className="w-5 h-5 opacity-80"/></>}
                </button>
            )}

            {/* 4. IN_PROGRESS -> ACTIONS */}
            {isWorking && (
                <div className="grid grid-cols-[1fr_2fr] gap-4">
                    <button 
                        onClick={() => navigate(`/technician/jobs/${id}/extras`)}
                        className="bg-white text-gray-700 font-bold py-4 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <PlusCircle className="w-5 h-5 text-gray-500"/>
                        Extras
                    </button>

                    <button 
                        onClick={() => navigate(`/technician/jobs/${id}/complete`)}
                        className="bg-gray-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-black flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        Complete Job <ChevronRight className="w-5 h-5 opacity-70"/>
                    </button>
                </div>
            )}
        </div>
      </div>

    </div>
  );
};

export default ActiveJobPage;