import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  User, Briefcase, CreditCard, Settings, ChevronRight,
  ShieldCheck, Star, MapPin, LogOut, Wrench, Award,ShieldAlert, Timer, AlertCircle, ArrowRight
} from "lucide-react";
import type { RootState } from "../../../../store/store";
import { format } from "date-fns";

const TechnicianProfile: React.FC = () => {
  const navigate = useNavigate();
  const { profile, stats } = useSelector((state: RootState) => state.technician);

  if (!profile) return null;

  const memberSince = profile.createdAt ? format(new Date(profile.createdAt), "MMMM yyyy") : "2024";
  const isVerified = profile.verificationStatus === "VERIFIED";

  // --- MENU CONFIG ---
  const menuItems = [
    {
      id: "personal",
      label: "Personal Details",
      subLabel: "Name, Phone, Bio, Experience",
      icon: User,
      color: "text-blue-600",
      bg: "bg-blue-50",
      path: "/technician/profile/personal"
    },
    {
      id: "services",
      label: "My Services & Skills",
      subLabel: "Active Services, Work Zones",
      icon: Wrench,
      color: "text-orange-600",
      bg: "bg-orange-50",
      path: "/technician/profile/services"
    },
    {
      id: "payouts",
      label: "Payout Settings",
      subLabel: "Bank Account, PAN Details",
      icon: CreditCard,
      color: "text-green-600",
      bg: "bg-green-50",
      path: "/technician/profile/payouts"
    },
    {
      id: "settings",
      label: "App Settings",
      subLabel: "Notifications, Language, Support",
      icon: Settings,
      color: "text-gray-600",
      bg: "bg-gray-100",
      path: "/technician/profile/settings"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">

      {/* --- HEADER: IDENTITY CARD --- */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-5 relative z-10">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-gray-100 overflow-hidden">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-full h-full p-6 text-gray-300" />
              )}
            </div>
            {isVerified && (
              <div className="absolute bottom-1 right-1 bg-blue-600 text-white p-1 rounded-full border-2 border-white shadow-sm" title="Verified Partner">
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
              {profile?.name || "Partner"}
              {isVerified && <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wide border border-blue-100">Verified</span>}
            </h1>
            <p className="text-sm text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2">
              <MapPin className="w-3.5 h-3.5" />
              {profile.zoneIds?.length ? `${profile.zoneIds.length} Active Zones` : "No Zone Selected"}
            </p>
            <p className="text-xs text-gray-400">Member since {memberSince}</p>
          </div>

          {/* Quick Rating Badge */}
          <div className="bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-100 flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-xl font-bold text-gray-900">{profile.rating?.average || "4.8"}</span>
            </div>
            <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-wide">Rating</span>
          </div>
        </div>
 
        {(() => { 
          if (profile.verificationStatus === "REJECTED") {
            return (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-pulse-slow">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-full text-red-600 shadow-sm shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-red-900">Application Rejected</h3>
                    <p className="text-xs text-red-700 mt-1 leading-relaxed">
                      {profile.globalRejectionReason || "Some details didn't match our criteria. Please review and resubmit."}
                    </p>
                    <button 
                      onClick={() => navigate("/technician/onboarding")}
                      className="mt-3 flex items-center gap-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                      Fix & Resubmit <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // 2. VERIFICATION PENDING STATE
          if (profile.verificationStatus === "VERIFICATION_PENDING") {
            return (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-full text-blue-600 shadow-sm shrink-0">
                    <Timer className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-blue-900">Under Review</h3>
                    <p className="text-xs text-blue-700 mt-1">
                      Our team is verifying your documents. This usually takes 24-48 hours. You will be notified once approved.
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          // 3. INCOMPLETE / PENDING STATE
          if (profile.verificationStatus === "PENDING") {
            return (
              <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-full text-orange-600 shadow-sm shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-orange-900">Profile Incomplete</h3>
                    <p className="text-xs text-orange-700 mt-1">
                      You are on <strong>Step {profile.onboardingStep || 1} of 6</strong>. Complete your profile to start receiving jobs.
                    </p>
                    <button 
                      onClick={() => navigate("/technician/onboarding")}
                      className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-bold text-orange-800 bg-orange-100 hover:bg-orange-200 border border-orange-200 px-4 py-2 rounded-lg transition-colors"
                    >
                      Continue Application <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          // 4. VERIFIED (Return null or a success badge if desired)
          return null; 
        })()}
      </div>

      {/* --- STATS ROW (Brief Overview) --- */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1 text-gray-500">
            <Award className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Total Jobs</span>
          </div>
          <span className="text-xl font-bold text-gray-900">{stats?.completedJobs || 0}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1 text-gray-500">
            <Briefcase className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Experience</span>
          </div>
          <span className="text-xl font-bold text-gray-900">{profile.experienceSummary}</span>
        </div>
      </div>

      {/* --- MENU LIST --- */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {menuItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left group ${index !== menuItems.length - 1 ? "border-b border-gray-100" : ""
              }`}
          >
            {/* Icon Box */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.bg} ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>

            {/* Text */}
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {item.label}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{item.subLabel}</p>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500" />
          </button>
        ))}
      </div>

      {/* --- LOGOUT SECTION --- */}
      <div className="pt-4 flex justify-center">
        <button
          className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-6 py-3 rounded-xl transition-colors"
          onClick={() => {
            // Add actual logout logic here
            console.log("Logging out...");
          }}
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

    </div>
  );
};

export default TechnicianProfile;