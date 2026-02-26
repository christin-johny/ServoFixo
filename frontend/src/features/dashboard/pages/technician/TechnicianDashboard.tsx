import React, { useEffect, useState } from 'react';
import { 
  Power, Star, CheckCircle, Award, Clock, 
  ChevronRight, PlayCircle, Wallet, User, MapPin, Loader2, Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../../../store/store';
import { getTechnicianDashboardSummary } from '../../api/dashboardRepository';
import { toggleOnlineStatus } from "../../../profile/api/technicianProfileRepository";
import { setAvailability } from "../../../../store/technicianSlice";
import { useNotification } from "../../../notifications/hooks/useNotification";
import { setActiveJob, clearIncomingJob } from "../../../../store/technicianBookingSlice";
import type { TechnicianDashboardData } from '../../types/DashboardTypes';

const TechnicianDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccess, showError } = useNotification();
  
  // --- STATE ---
  const [data, setData] = useState<TechnicianDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState(false);

  // --- REDUX SELECTORS ---
  const { profile } = useSelector((state: RootState) => state.technician);
  const { activeJob } = useSelector((state: RootState) => state.technicianBooking);

  const isOnline = profile?.availability?.isOnline || false;
  const isVerified = profile?.verificationStatus === "VERIFIED";

  // --- 1. SYNC DASHBOARD ON LOAD ---
  useEffect(() => {
    const syncDashboard = async () => {
      try {
        const summary = await getTechnicianDashboardSummary();
        setData(summary);
        
        if (summary.activeJob) {
          dispatch(setActiveJob(summary.activeJob));
        } else {
          dispatch(clearIncomingJob());
        }
      } catch (err) {
        console.error("Dashboard sync failed", err);
      } finally {
        setLoading(false);
      }
    };

    syncDashboard();
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
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto bg-[#FDFDFD]">
      
      {/* SECTION 1: WELCOME & STATUS TOGGLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome, {profile?.name?.split(' ')[0] || 'Partner'}!
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1 flex items-center gap-2">
            <Clock size={14} /> {isOnline ? 'Your shop is open' : 'You are currently offline'}
          </p>
        </div>
        <button 
          onClick={handleToggleOnline}
          disabled={!isVerified || isLocating}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black transition-all shadow-sm ${
            !isVerified ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" :
            isOnline 
            ? 'bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700' 
            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
          }`}
        >
          {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />} 
          {!isVerified ? "Verification Pending" : isLocating ? "Locating..." : isOnline ? 'Online' : 'Go Online'}
        </button>
      </div>

      {/* SECTION 2: MAIN GRID (Active Job & Wallet) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Job / Offline Call to Action Card */}
        <div className="lg:col-span-8">
          {!isOnline ? (
            /* CASE 1: OFFLINE VIEW */
            <div 
              onClick={handleToggleOnline}
              className="h-full min-h-[280px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center group cursor-pointer hover:bg-slate-100 hover:border-emerald-300 transition-all"
            >
               <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <Power size={32} className="text-slate-300 group-hover:text-emerald-500" />
               </div>
               <p className="font-black text-slate-900 text-lg">Go Online to Get Work</p>
               <p className="text-xs text-slate-500 max-w-[220px] mt-2">
                 You must be online to receive new service requests or manage existing jobs.
               </p>
            </div>
          ) : activeJob ? (
            /* CASE 2: ONLINE WITH ACTIVE JOB */
            <div 
              onClick={() => navigate(`/technician/jobs/${activeJob.id}`)}
              className="h-full min-h-[280px] bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group cursor-pointer"
            >
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <span className={`bg-emerald-500 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-widest`}>
                    {activeJob.status.replace('_', ' ')}
                  </span>
                  <h2 className="text-3xl font-black mt-4 leading-tight">
                    {activeJob.serviceName}
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-4 text-slate-400 font-bold text-xs">
                    <span className="flex items-center gap-1"><User size={14}/> {activeJob.customerName}</span>
                    <span className="flex items-center gap-1"><MapPin size={14}/> {activeJob.location}</span>
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-emerald-400 font-black uppercase text-xs">
                     <PlayCircle className="animate-pulse" size={18} /> {activeJob.status === 'COMPLETED' ? "Collect Payment" : "Resume Job"}
                   </div>
                   <div className="bg-white/10 p-3 rounded-xl group-hover:bg-emerald-50 transition-colors group-hover:text-emerald-900">
                     <ChevronRight size={20} />
                   </div>
                </div>
              </div>
            </div>
          ) : (
            /* CASE 3: ONLINE WITHOUT ACTIVE JOB */
            <div className="h-full min-h-[280px] bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center text-emerald-600">
               <Briefcase size={40} className="mb-3 opacity-40 animate-bounce" />
               <p className="font-bold">Searching for Jobs...</p>
               <p className="text-xs max-w-[200px] mt-1 text-emerald-700/70">Stay online. We will notify you as soon as a match is found in your zone.</p>
            </div>
          )}
        </div>

        {/* Wallet Balance Card */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                <Wallet size={12} /> Wallet Balance
            </p>
            <h3 className="text-4xl font-black text-slate-900">₹{data?.earnings.walletBalance.toLocaleString()}</h3>
            <div className="mt-4 p-3 bg-emerald-50 rounded-xl">
              <p className="text-[10px] font-black text-emerald-700 uppercase">Lifetime Earnings</p>
              <p className="text-lg font-black text-emerald-600">₹{data?.earnings.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/technician/profile/payouts')}
            className="w-full mt-6 py-3.5 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-slate-800 transition-all active:scale-[0.98]"
          >
            Manage Wallet
          </button>
        </div>
      </div>

      {/* SECTION 3: BOTTOM PERFORMANCE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          icon={<Star className="text-orange-500" />} 
          label="Reputation" 
          value={`${data?.performance.averageRating || '0.0'} / 5`} 
          sub="Average Customer Rating"
        />
        <MetricCard 
          icon={<CheckCircle className="text-emerald-500" />} 
          label="Jobs Done" 
          value={data?.performance.totalJobs || 0} 
          sub="Total Lifetime Completed"
        />
        <MetricCard 
          icon={<Award className="text-purple-500" />} 
          label="Success Rate" 
          value="98%" 
          sub="Platform Performance"
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
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-emerald-200 transition-colors">
    <div className="p-4 bg-slate-50 rounded-2xl group-hover:scale-105 transition-transform">{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-[10px] font-bold text-slate-400">{sub}</p>
    </div>
  </div>
);

export default TechnicianDashboard;