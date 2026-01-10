import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Power, MapPin, Star, DollarSign, ShieldAlert, Briefcase, Timer, AlertCircle, Loader2, type LucideIcon, ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../hooks/useNotification";
import type { RootState, AppDispatch } from "../../../../store/store";
import { setAvailability } from "../../../../store/technicianSlice";
import { toggleOnlineStatus } from "../../../../infrastructure/repositories/technician/technicianProfileRepository";

interface ProfileWithRejection {
  globalRejectionReason?: string;
  rejectionReason?: string;
}
 
interface ApiError {
  response?: { data?: { error?: string; message?: string } };
  message?: string;     
}
 
const extractErrorMessage = (error: unknown): string => {
  if (!error) return "An unknown error occurred.";
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    const err = error as ApiError; 
    return err.response?.data?.error || err.response?.data?.message || err.message || "Failed to update status.";
  }
  return "Failed to update status.";
};

const TechnicianDashboard: React.FC = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dispatch = useDispatch<AppDispatch>();
  
  const { profile, stats } = useSelector((state: RootState) => state.technician);
  const [isLocating, setIsLocating] = useState(false);
  const { showSuccess, showError } = useNotification();

  const status = profile?.verificationStatus || "PENDING";
  const onboardingStep = profile?.onboardingStep || 0;
  const isOnline = profile?.availability?.isOnline || false;

  const isVerified = status === "VERIFIED";
  const isPendingVerification = status === "VERIFICATION_PENDING";
  const isRejected = status === "REJECTED";
  const isIncomplete = status === "PENDING" && onboardingStep < 7; 

  // --- REJECTION LOGIC ---
  const rejectedDocs = profile?.documents?.filter(d => d.status === "REJECTED") || [];
  const hasDocRejection = rejectedDocs.length > 0;
  
  const profileRejection = profile as unknown as ProfileWithRejection;
  const rawGlobalReason = profileRejection?.globalRejectionReason || profileRejection?.rejectionReason;
  // Don't show generic text if we have specific docs
  const showGlobalReason = rawGlobalReason && rawGlobalReason !== "Invalid Documents";

  const handleFixProfile = () => {
      if (hasDocRejection && !showGlobalReason) {
          navigate("/technician/onboarding", { state: { step: 5 } });
      } else {
          navigate("/technician/onboarding", { state: { step: 1 } });
      }
  };

  const handleToggleOnline = async () => {
    if (!isVerified) return;
    setIsLocating(true);
 
    try {
        if (isOnline) {
             const response = await toggleOnlineStatus({ isOnline: false });
             dispatch(setAvailability(response.isOnline));
             showSuccess("You are now Offline");
        } else {
            if (!navigator.geolocation) throw new Error("Geolocation not supported");
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;
                const response = await toggleOnlineStatus({ isOnline: true, lat: latitude, lng: longitude });
                dispatch(setAvailability(response.isOnline));
                showSuccess("You are now Online!");
                setIsLocating(false);
              },
              (err) => { throw err; },
              { enableHighAccuracy: true, timeout: 10000 }
            );
            return; // Exit here to wait for callback
        }
    } catch (err: unknown) {  
         showError(extractErrorMessage(err));
    } finally {
         if (isOnline) setIsLocating(false); // Only stop loading here if going offline or error
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">
            {profile?.personalDetails?.name ? `Welcome back, ${profile.personalDetails.name}.` : "Welcome back, Partner."}
          </p>
        </div>
        
        <button 
          onClick={handleToggleOnline}
          disabled={!isVerified || isLocating}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${
            !isVerified ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" : 
            isOnline ? "bg-green-600 text-white hover:bg-green-700 shadow-green-200" : 
            "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
          {!isVerified ? "Verification Pending" : isLocating ? "Locating..." : isOnline ? "You are Online" : "Go Online"}
        </button>
      </div>

      {/* --- STATUS BANNERS (Compact) --- */}

      {/* Case A: Incomplete */}
      {isIncomplete && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-orange-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-orange-900">Setup Required</h3>
              <p className="text-xs text-orange-700">Complete your profile to accept jobs.</p>
            </div>
          </div>
          <button onClick={() => navigate("/technician/onboarding")} className="text-xs font-bold bg-white border border-orange-300 text-orange-700 px-3 py-1.5 rounded hover:bg-orange-50 whitespace-nowrap">
            Complete Setup
          </button>
        </div>
      )}

      {/* Case B: Pending */}
      {isPendingVerification && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3 shadow-sm">
           <Timer className="w-5 h-5 text-blue-600 shrink-0" />
           <div className="flex-1">
             <h3 className="text-sm font-bold text-blue-900">Verification in Progress</h3>
             <p className="text-xs text-blue-700">We are reviewing your profile. You'll be notified soon.</p>
           </div>
        </div>
      )}

      {/* Case C: REJECTED (Compact & Readable) */}
      {isRejected && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start md:items-center gap-3">
             <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5 md:mt-0" />
             <div>
               <h3 className="text-sm font-bold text-red-900">Application Returned</h3>
               <div className="text-xs text-red-700 mt-0.5">
                  {showGlobalReason && <span>Note: {rawGlobalReason}</span>}
                  {showGlobalReason && hasDocRejection && <span className="mx-1">•</span>}
                  {hasDocRejection && <span>{rejectedDocs.length} document{rejectedDocs.length > 1 ? 's' : ''} rejected ({rejectedDocs.map(d => d.type.replace(/_/g, ' ')).join(', ')})</span>}
               </div>
             </div>
          </div>
          
          <button 
            onClick={handleFixProfile}
            className="flex items-center gap-1 bg-red-600 text-white px-4 py-1.5 rounded-md font-bold text-xs hover:bg-red-700 transition-all shadow-sm whitespace-nowrap self-end md:self-auto"
          >
            {hasDocRejection && !showGlobalReason ? "Fix Documents" : "Review Profile"} 
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Today's Earnings" value={isVerified ? `₹ ${stats.todayEarnings}` : "--"} color="text-green-600" bg="bg-green-50" />
        <StatCard icon={MapPin} label="Active Zone" value={isVerified ? "Active" : "--"} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={Star} label="Rating" value={isVerified ? (profile?.rating?.average || "New") : "--"} color="text-yellow-500" bg="bg-yellow-50" />
        <StatCard icon={Briefcase} label="Jobs Done" value={isVerified ? stats.completedJobs : "--"} color="text-purple-600" bg="bg-purple-50" />
      </div>

    </div>
  );
};
 
interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  bg: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex flex-col items-center text-center md:items-start md:text-left">
    <div className={`p-1.5 rounded-md mb-2 ${bg} ${color}`}>
      <Icon className="w-4 h-4" />
    </div>
    <span className="text-xl font-bold text-gray-900">{value}</span>
    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">{label}</span>
  </div>
);

export default TechnicianDashboard;