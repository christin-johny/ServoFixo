import React, { useState } from "react";
import { 
  Power, 
  MapPin, 
  Star, 
  DollarSign, 
  ShieldAlert, 
  Briefcase, 
  type LucideIcon 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// In real app, this comes from Redux/API
const MOCK_STATUS = "PENDING"; 

const TechnicianDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState<boolean>(false);
  
  // Explicitly type as string to allow comparison logic
  const status: string = MOCK_STATUS; 

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, Partner.</p>
        </div>
        
        {/* Online/Offline Toggle */}
        <button 
          onClick={() => status === "VERIFIED" && setIsOnline(!isOnline)}
          disabled={status !== "VERIFIED"}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold transition-all shadow-sm ${
            status !== "VERIFIED" 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
              : isOnline 
                ? "bg-green-600 text-white hover:bg-green-700 shadow-green-200" 
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }`}
        >
          <Power className="w-5 h-5" />
          {status !== "VERIFIED" ? "Verification Pending" : isOnline ? "You are Online" : "Go Online"}
        </button>
      </div>

      {/* Verification Alert */}
      {status !== "VERIFIED" && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="p-2 bg-orange-100 rounded-full text-orange-600 flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-orange-900">Action Required</h3>
            <p className="text-sm text-orange-700 mt-1">
              You cannot accept jobs yet. Please complete your profile and upload documents.
            </p>
          </div>
          <button 
            onClick={() => navigate("/technician/onboarding")}
            className="w-full md:w-auto text-sm font-semibold bg-white border border-orange-300 text-orange-700 px-4 py-2 rounded hover:bg-orange-50 transition-colors"
          >
            Complete Profile
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Today's Earnings" value="₹ 0" color="text-green-600" bg="bg-green-50" />
        <StatCard icon={MapPin} label="Active Zone" value={status === "VERIFIED" ? "Kochi" : "--"} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={Star} label="Rating" value="--" color="text-yellow-500" bg="bg-yellow-50" />
        <StatCard icon={Briefcase} label="Jobs Done" value="0" color="text-purple-600" bg="bg-purple-50" />
      </div>

    </div>
  );
};

// ✅ Defined Strict Interface
interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: string;
  bg: string;
}

// ✅ Applied Interface to Component
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