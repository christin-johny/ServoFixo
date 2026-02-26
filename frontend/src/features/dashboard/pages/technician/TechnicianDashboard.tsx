import React, { useEffect, useState } from 'react';
import { 
  Power, Star,  CheckCircle, ChevronRight, 
  PlayCircle, Award, Briefcase, MapPin, User, Clock 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store/store';
import { getTechnicianDashboardSummary } from '../../api/dashboardRepository';
import type { TechnicianDashboardData } from '../../types/DashboardTypes';

const TechnicianDashboard: React.FC = () => {
  const [data, setData] = useState<TechnicianDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { profile } = useSelector((state: RootState) => state.technician);
  const navigate = useNavigate();

  const isOnline = profile?.availability?.isOnline;

  useEffect(() => {
  const loadDashboard = async () => {
    try {
      const summary = await getTechnicianDashboardSummary();
      setData(summary);
      console.log("Current Active Job Data:", summary.activeJob);
    } catch (err) {
      console.error("Dashboard failed to load", err);
    } finally {
      setLoading(false);
    }
  };
  loadDashboard();
}, []);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
    </div>
  );

  return (
    /* Removed lg:p-10 and min-h-screen to prevent double-scroll and high top-gap */
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto bg-[#FDFDFD]">
      
      {/* SECTION 1: WELCOME & STATUS */}
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
          className={`flex items-center gap-3 px-6 py-3 rounded-xl text-xs font-black transition-all ${
            isOnline 
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' 
            : 'bg-slate-100 text-slate-400 border border-slate-200'
          }`}
        >
          <Power size={16} /> {isOnline ? 'Online' : 'Go Online'}
        </button>
      </div>

      {/* SECTION 2: MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Job Card */}
        <div className="lg:col-span-8">
          {data?.activeJob ? (
            <div 
              onClick={() => navigate(`/technician/jobs/${data.activeJob?.id}`)}
              className="h-full min-h-[280px] bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group cursor-pointer"
            >
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <span className="bg-emerald-500 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-widest">
                    Current Task
                  </span>
                  <h2 className="text-3xl font-black mt-4 leading-tight">
                    {data.activeJob.serviceName}
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-4 text-slate-400 font-bold text-xs">
                    <span className="flex items-center gap-1"><User size={14}/> {data.activeJob.customerName}</span>
                    <span className="flex items-center gap-1"><MapPin size={14}/> {data.activeJob.location}</span>
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-emerald-400 font-black uppercase text-xs">
                     <PlayCircle className="animate-pulse" size={18} /> Resume Job
                   </div>
                   <div className="bg-white/10 p-3 rounded-xl group-hover:bg-emerald-500 transition-colors">
                     <ChevronRight size={20} className="text-white" />
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[280px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center text-slate-400">
               <Briefcase size={40} className="mb-3 opacity-20" />
               <p className="font-bold">No Active Jobs</p>
               <p className="text-xs max-w-[200px] mt-1">Go online to start receiving service requests.</p>
            </div>
          )}
        </div>

        {/* Wallet Balance Card */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Wallet Balance</p>
            <h3 className="text-4xl font-black text-slate-900">₹{data?.earnings.walletBalance.toLocaleString()}</h3>
            <div className="mt-4 p-3 bg-emerald-50 rounded-xl">
              <p className="text-[10px] font-black text-emerald-700 uppercase">Lifetime Earnings</p>
              <p className="text-lg font-black text-emerald-600">₹{data?.earnings.totalEarnings.toLocaleString()}</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/technician/profile/payouts')}
            className="w-full mt-6 py-3.5 bg-slate-900 text-white rounded-xl font-black text-xs hover:bg-slate-800 transition-all"
          >
            Manage Wallet
          </button>
        </div>
      </div>

      {/* SECTION 3: BOTTOM METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          icon={<Star className="text-orange-500" />} 
          label="Reputation" 
          value={`${data?.performance.averageRating} / 5`} 
          sub="Customer Rating"
        />
        <MetricCard 
          icon={<CheckCircle className="text-emerald-500" />} 
          label="Jobs Done" 
          value={data?.performance.totalJobs} 
          sub="Lifetime Completed"
        />
        <MetricCard 
          icon={<Award className="text-purple-500" />} 
          label="Success" 
          value="98%" 
          sub="Completion Rate"
        />
      </div>
    </div>
  );
};

// --- TYPES & SUB-COMPONENTS ---

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