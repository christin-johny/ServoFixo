import React, { useEffect, useState } from 'react';
import { 
  Power, Star, CheckCircle, Clock, 
  ChevronRight, PlayCircle,   User, MapPin, Loader2, Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../store/store';
import { getTechnicianDashboardSummary } from '../../api/dashboardRepository';
import { toggleOnlineStatus } from "../../../profile/api/technicianProfileRepository";
import { setAvailability } from "../../../../store/technicianSlice";
import { useNotification } from "../../../notifications/hooks/useNotification"; 
import type { TechnicianDashboardData } from '../../types/DashboardTypes';
import { getWalletDetails } from "../../../profile/api/technicianWalletRepository";  
import { setWalletData } from "../../../../store/technicianSlice";
import WalletProgressCard from "../../../profile/components/technician/WalletProgressCard";

const TechnicianDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccess, showError } = useNotification();
  
  // --- STATE ---
  const [data, setData] = useState<TechnicianDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState(false);

  // --- REDUX SELECTORS ---
  const { profile, wallet } = useSelector((state: RootState) => state.technician);
  const { activeJob } = useSelector((state: RootState) => state.technicianBooking);

  const isOnline = profile?.availability?.isOnline || false;
  const isVerified = profile?.verificationStatus === "VERIFIED";

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [summary, walletDetails] = await Promise.all([
          getTechnicianDashboardSummary(),
          getWalletDetails() // Parallel fetch for speed
        ]);
        setData(summary);
        dispatch(setWalletData(walletDetails)); // Update Redux
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [dispatch]);

  // --- 2. ONLINE / OFFLINE TOGGLE LOGIC ---
  const handleToggleOnline = async () => {
    if (!isVerified) return;
    setIsLocating(true);

    try {
      if (isOnline) {
        const response = await toggleOnlineStatus({ isOnline: false });
        dispatch(setAvailability(response.isOnline));
        showSuccess("You are now Offline");
      } else {
        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported by your browser");
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const response = await toggleOnlineStatus({ 
                isOnline: true, 
                lat: latitude, 
                lng: longitude 
              });
              dispatch(setAvailability(response.isOnline));
              showSuccess("You are now Online!");
            } catch (err: unknown) {
              let message = "Failed to update status";

              if (err instanceof Error) {
                message = err.message;
              }

              if (
                typeof err === "object" &&
                err !== null &&
                "response" in err
              ) {
                const maybeError = err as {
                  response?: {
                    data?: {
                      message?: string;
                    };
                  };
                };

                message = maybeError.response?.data?.message ?? message;
              }

              showError(message);
            } finally {
              setIsLocating(false);
            }
          },
          () => {
            showError("Please enable GPS permissions to go online.");
            setIsLocating(false);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
        return; 
      }
    } catch (err: unknown) {
        let message = "An error occurred";

        if (
          typeof err === "object" &&
          err !== null &&
          "response" in err
        ) {
          const e = err as {
            response?: {
              data?: {
                message?: string;
              };
            };
          };

          message = e.response?.data?.message ?? message;
        } else if (err instanceof Error) {
          message = err.message;
        }

        showError(message);
      } finally {
      setIsLocating(false);
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto bg-slate-50 min-h-screen">
      
      {/* SECTION 1: WELCOME & STATUS TOGGLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, {profile?.name?.split(' ')[0] || 'Partner'}!
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1 flex items-center gap-2">
            <Clock size={16} className={isOnline ? "text-emerald-500" : "text-slate-400"} /> 
            {isOnline ? 'You are online and visible to customers.' : 'You are currently offline. Go online to get work.'}
          </p>
        </div>
        <button 
          onClick={handleToggleOnline}
          disabled={!isVerified || isLocating}
          className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl text-sm font-black transition-all shadow-sm ${
            !isVerified ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200" :
            isOnline 
            ? 'bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700 hover:shadow-md' 
            : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          {isLocating ? <Loader2 size={18} className="animate-spin" /> : <Power size={18} className={isOnline ? "text-emerald-200" : "text-slate-400"} />} 
          {!isVerified ? "Verification Pending" : isLocating ? "Locating..." : isOnline ? 'You are Online' : 'Go Online Now'}
        </button>
      </div>

      {/* SECTION 2: MAIN GRID (Active Job & Wallet) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Active Job / Offline Call to Action Card */}
        <div className="lg:col-span-8 flex flex-col">
          {!isOnline ? (
            /* CASE 1: OFFLINE VIEW */
            <div 
              onClick={handleToggleOnline}
              className="flex-1 bg-white border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center p-8 text-center group cursor-pointer hover:bg-slate-50 hover:border-emerald-400 transition-all min-h-[300px]"
            >
               <div className="bg-slate-100 p-5 rounded-full shadow-sm mb-5 group-hover:bg-emerald-100 group-hover:scale-110 transition-all duration-300">
                  <Power size={36} className="text-slate-400 group-hover:text-emerald-600" />
               </div>
               <h2 className="font-black text-slate-900 text-xl">Go Online to Get Work</h2>
               <p className="text-sm text-slate-500 max-w-sm mt-3 leading-relaxed">
                 You are currently invisible to customers. Switch your status to online to start receiving new service requests in your area.
               </p>
            </div>
          ) : activeJob ? (
            /* CASE 2: ONLINE WITH ACTIVE JOB */
            <div 
              onClick={() => navigate(`/technician/jobs/${activeJob.id}`)}
              className="flex-1 bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden group cursor-pointer min-h-[300px] flex flex-col justify-between hover:shadow-2xl transition-shadow"
            >
              {/* Decorative background element */}
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase px-3 py-1.5 rounded-lg tracking-widest border border-emerald-500/20">
                      {activeJob.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black mt-5 leading-tight group-hover:text-emerald-300 transition-colors">
                    {activeJob.serviceName}
                  </h2>
                  <div className="mt-5 flex flex-wrap gap-5 text-slate-300 font-medium text-sm">
                    <span className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg"><User size={16} className="text-slate-400"/> {activeJob.customerName}</span>
                    <span className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-lg"><MapPin size={16} className="text-slate-400"/> {activeJob.location}</span>
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-between border-t border-slate-700/50 pt-6">
                   <div className="flex items-center gap-3 text-emerald-400 font-black uppercase text-sm tracking-wide">
                     <PlayCircle className="animate-pulse" size={20} /> 
                     {activeJob.status === 'COMPLETED' ? "Collect Payment" : "View Job Details"}
                   </div>
                   <div className="bg-slate-800 p-3 rounded-xl group-hover:bg-emerald-500 group-hover:text-slate-900 transition-all">
                     <ChevronRight size={20} />
                   </div>
                </div>
              </div>
            </div>
          ) : (
            /* CASE 3: ONLINE WITHOUT ACTIVE JOB */
            <div className="flex-1 bg-emerald-50 border-2 border-emerald-200/60 rounded-3xl flex flex-col items-center justify-center p-8 text-center min-h-[300px] relative overflow-hidden">
               {/* Radar animation effect */}
               <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                 <div className="w-64 h-64 border border-emerald-400 rounded-full animate-[ping_3s_ease-in-out_infinite]"></div>
                 <div className="absolute w-48 h-48 border border-emerald-400 rounded-full animate-[ping_3s_ease-in-out_infinite_0.5s]"></div>
               </div>
               
               <div className="bg-white p-5 rounded-full shadow-sm mb-5 relative z-10">
                 <Briefcase size={36} className="text-emerald-500 animate-bounce" />
               </div>
               <h2 className="font-black text-emerald-900 text-xl relative z-10">Searching for Jobs...</h2>
               <p className="text-sm max-w-sm mt-3 text-emerald-700/80 leading-relaxed relative z-10">
                 You are online and visible. Keep the app open; we will notify you immediately when a new request matches your skills and zone.
               </p>
            </div>
          )}
        </div>

        {/* Wallet Container - Fixed Grid Spanning */}
        {wallet && (
          <div className="lg:col-span-4 flex flex-col">
            <div className="flex-1 h-full">
              <WalletProgressCard 
                data={wallet} 
                onManageClick={() => navigate('/technician/profile/payouts')} 
              />
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: BOTTOM PERFORMANCE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard 
          icon={<Star className="text-amber-500" size={24} />} 
          label="Reputation Score" 
          value={`${data?.performance.averageRating || '0.0'} / 5`} 
          sub="Average rating from completed jobs"
        />
        <MetricCard 
          icon={<CheckCircle className="text-emerald-500" size={24} />} 
          label="Jobs Completed" 
          value={data?.performance.totalJobs || 0} 
          sub="Total lifetime jobs finished successfully"
        />
      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | undefined;
  sub: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, sub }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6 group hover:border-emerald-300 hover:shadow-md transition-all cursor-default">
    <div className="p-4 bg-slate-50 rounded-2xl group-hover:scale-110 group-hover:bg-emerald-50 transition-all duration-300">
      {icon}
    </div>
    <div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-black text-slate-900">{value}</p>
      <p className="text-xs font-medium text-slate-500 mt-1">{sub}</p>
    </div>
  </div>
);

export default TechnicianDashboard;