import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Power, 
  MapPin, 
  Star, 
  DollarSign, 
  ShieldAlert, 
  Briefcase, 
  Timer, 
  AlertCircle, 
  Loader2, 
  type LucideIcon 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../hooks/useNotification";
import type { RootState, AppDispatch } from "../../../../store/store";
import { setAvailability } from "../../../../store/technicianSlice";
import { toggleOnlineStatus } from "../../../../infrastructure/repositories/technician/technicianProfileRepository";

// ✅ 1. Define the structure of an Axios Error
interface ApiError {
  response?: {
    data?: {
      error?: string;   // Matches {"error": "..."}
      message?: string; // Matches {"message": "..."}
    };
  };
  message?: string;     // Matches standard JS Error message
}

// ✅ 2. Robust Error Extractor (No 'any')
const extractErrorMessage = (error: unknown): string => {
  if (!error) return "An unknown error occurred.";

  // If it's just a string, return it
  if (typeof error === "string") return error;

  // Check if it's an object to safely access properties
  if (typeof error === "object") {
    const err = error as ApiError; // Safe assertion for checking

    // Priority 1: Backend 'error' field (Your specific case)
    if (err.response?.data?.error) {
      return err.response.data.error;
    }

    // Priority 2: Backend 'message' field
    if (err.response?.data?.message) {
      return err.response.data.message;
    }

    // Priority 3: Standard JS/Axios error message (e.g., "Network Error")
    if (err.message) {
      return err.message;
    }
  }

  return "Failed to update status. Please try again.";
};

const TechnicianDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { profile, stats } = useSelector((state: RootState) => state.technician);
  const [isLocating, setIsLocating] = useState(false);
  const { showSuccess, showError } = useNotification();

  // Default Fallbacks
  const status = profile?.verificationStatus || "PENDING";
  const onboardingStep = profile?.onboardingStep || 0;
  const isOnline = profile?.availability?.isOnline || false;

  const isVerified = status === "VERIFIED";
  const isPendingVerification = status === "VERIFICATION_PENDING";
  const isRejected = status === "REJECTED";
  const isIncomplete = status === "PENDING" || (status === "REJECTED" && onboardingStep < 7); 

  const handleToggleOnline = async () => {
    if (!isVerified) return;

    // --- CASE 1: Going OFFLINE (No location needed) ---
    if (isOnline) {
       try {
         setIsLocating(true);
         const response = await toggleOnlineStatus({ isOnline: false });
         
         // Sync Redux
         dispatch(setAvailability(response.isOnline));
         showSuccess("You are now Offline");
       } catch (err: unknown) { // ✅ Use unknown
         const message = extractErrorMessage(err);
         showError(message);
       } finally {
         setIsLocating(false);
       }
       return;
    }

    // --- CASE 2: Going ONLINE (Location Required) ---
    setIsLocating(true);
    
    if (!navigator.geolocation) {
      showError("Geolocation is not supported by your browser");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // 1. Call API
          const response = await toggleOnlineStatus({ 
            isOnline: true, 
            lat: latitude, 
            lng: longitude 
          });

          // 2. Dispatch Success to Redux
          dispatch(setAvailability(response.isOnline));
          showSuccess("You are now Online!");

        } catch (err: unknown) { // ✅ Use unknown & Trace it down
           console.error("Online Toggle Error:", err);
           
           // Extract specific error (e.g., "Outside Zone")
           const message = extractErrorMessage(err);
           showError(message);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        let msg = "Unable to retrieve location";
        if (error.code === 1) msg = "Location permission denied. Please enable it.";
        if (error.code === 2) msg = "Location unavailable. Check your GPS.";
        showError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">
            {profile?.name ? `Welcome back, ${profile.name}.` : "Welcome back, Partner."}
          </p>
        </div>
        
        {/* Online/Offline Toggle Button */}
        <button 
          onClick={handleToggleOnline}
          disabled={!isVerified || isLocating}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold transition-all shadow-sm ${
            !isVerified 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
              : isOnline 
                ? "bg-green-600 text-white hover:bg-green-700 shadow-green-200" 
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }`}
        >
          {isLocating ? (
             <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
             <Power className="w-5 h-5" />
          )}
          
          {!isVerified 
             ? "Verification Pending" 
             : isLocating 
               ? "Locating..." 
               : isOnline 
                 ? "You are Online" 
                 : "Go Online"
          }
        </button>
      </div>

      {/* --- DYNAMIC STATUS BANNERS --- */}

      {/* Case A: Incomplete Profile */}
      {isIncomplete && !isRejected && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm">
          <div className="p-2 bg-orange-100 rounded-full text-orange-600 flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-orange-900">Setup Required</h3>
            <p className="text-sm text-orange-700 mt-1">
              You cannot accept jobs yet. Please complete your onboarding steps.
            </p>
          </div>
          <button 
            onClick={() => navigate("/technician/onboarding")}
            className="w-full md:w-auto text-sm font-semibold bg-white border border-orange-300 text-orange-700 px-5 py-2.5 rounded-lg hover:bg-orange-50 transition-colors"
          >
            Complete Profile
          </button>
        </div>
      )}

      {/* Case B: Verification Pending */}
      {isPendingVerification && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm">
          <div className="p-2 bg-blue-100 rounded-full text-blue-600 flex-shrink-0">
            <Timer className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-blue-900">Verification in Progress</h3>
            <p className="text-sm text-blue-700 mt-1">
              Thanks for submitting your details! Our team is currently reviewing your documents. 
              You will be notified once approved.
            </p>
          </div>
          <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase tracking-wider">
            Under Review
          </div>
        </div>
      )}

      {/* Case C: Rejected */}
      {isRejected && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-sm">
          <div className="p-2 bg-red-100 rounded-full text-red-600 flex-shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-red-900">Application Rejected</h3>
            <p className="text-sm text-red-700 mt-1">
              Please update your details and resubmit your application.
            </p>
          </div>
          <button 
            onClick={() => navigate("/technician/onboarding")}
            className="w-full md:w-auto text-sm font-semibold bg-white border border-red-300 text-red-700 px-5 py-2.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            Fix Profile
          </button>
        </div>
      )}

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={DollarSign} 
          label="Today's Earnings" 
          value={isVerified ? `₹ ${stats.todayEarnings}` : "--"} 
          color="text-green-600" 
          bg="bg-green-50" 
        />
        <StatCard 
          icon={MapPin} 
          label="Active Zone" 
          value={isVerified ? "Active" : "--"} 
          color="text-blue-600" 
          bg="bg-blue-50" 
        />
        <StatCard 
          icon={Star} 
          label="Rating" 
          value={isVerified ? (profile?.rating?.average || "New") : "--"} 
          color="text-yellow-500" 
          bg="bg-yellow-50" 
        />
        <StatCard 
          icon={Briefcase} 
          label="Jobs Done" 
          value={isVerified ? stats.completedJobs : "--"} 
          color="text-purple-600" 
          bg="bg-purple-50" 
        />
      </div>

    </div>
  );
};

// Interface for StatCard
interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  bg: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center md:items-start md:text-left hover:shadow-md transition-shadow">
    <div className={`p-2 rounded-lg mb-3 ${bg} ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <span className="text-2xl font-bold text-gray-900">{value}</span>
    <span className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">{label}</span>
  </div>
);

export default TechnicianDashboard;