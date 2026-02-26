import React, { useEffect, useState } from 'react';
import { TrendingUp, AlertCircle, DollarSign, Briefcase, Wrench, Activity, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAdminDashboardStats } from '../../api/dashboardRepository';
import type { AdminDashboardData } from '../../types/DashboardTypes';


const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  
  useEffect(() => {
    getAdminDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <div className="p-10 text-center animate-pulse font-bold text-gray-400">Loading Metrics...</div>;

  return (
    <div className="p-6 bg-[#F8FAFC] min-h-screen space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">ServoFixo Command</h1>
          <p className="text-gray-500 font-medium">Platform-wide financial & operational health</p>
        </div>
        <span className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-2xl text-xs font-black uppercase tracking-tighter">
          <Activity size={14} className="animate-pulse" /> Live Data
        </span>
      </header>

      {/* Financials Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceCard 
          label="Total Revenue" 
          value={stats.financials.totalRevenue} 
          icon={<DollarSign />} 
          theme="emerald" 
        />
        <FinanceCard 
          label="Platform Net" 
          value={stats.financials.platformEarnings} 
          icon={<TrendingUp />} 
          theme="blue" 
        />
        <FinanceCard 
          label="Tech Liability" 
          value={stats.financials.techPayoutLiability} 
          icon={<AlertCircle />} 
          theme="orange" 
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Funnel */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h2 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
            <Briefcase size={20} className="text-blue-600" /> Booking Funnel
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <MetricBlock label="Active" value={stats.bookings.active} sub="In-progress" />
            <MetricBlock label="Completed" value={stats.bookings.completed} sub="Successful" />
            <MetricBlock label="Cancelled" value={stats.bookings.cancelled} sub="Failed/Rejected" />
            <MetricBlock label="Total" value={stats.bookings.total} sub="Lifetime count" />
          </div>
        </div>

        {/* Technician Supply */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <h2 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-2">
            <Wrench size={20} className="text-blue-600" /> Supply & Verification
          </h2>
          <div className="space-y-3">
            <StatusButton 
              label="Technicians Online" 
              value={stats.technicians.online} 
              onClick={() => navigate('/admin/technicians?isOnline=true')} 
            />
            <StatusButton 
              label="Pending Approval" 
              value={stats.technicians.pendingVerification} 
              isUrgent 
              onClick={() => navigate('/admin/technicians?status=VERIFICATION_PENDING')} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components for Admin ---
const FinanceCard = ({ label, value, icon, theme }: any) => (
  <div className={`p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm flex items-center justify-between`}>
    <div>
      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-black text-gray-900">₹{value.toLocaleString()}</p>
    </div>
    <div className={`p-4 rounded-3xl bg-${theme}-50 text-${theme}-600`}>{icon}</div>
  </div>
);

const MetricBlock = ({ label, value, sub }: any) => (
  <div className="bg-gray-50 p-6 rounded-3xl text-center">
    <p className="text-2xl font-black text-gray-900">{value}</p>
    <p className="text-[10px] font-black uppercase text-gray-500 mt-1">{label}</p>
    <p className="text-[9px] text-gray-400 italic mt-1">{sub}</p>
  </div>
);

const StatusButton = ({ label, value, isUrgent, onClick }: any) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${isUrgent ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`} />
      <span className="text-sm font-bold text-gray-700">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="font-black text-gray-900">{value}</span>
      <ChevronRight size={16} className="text-gray-400" />
    </div>
  </button>
);

export default AdminDashboard;