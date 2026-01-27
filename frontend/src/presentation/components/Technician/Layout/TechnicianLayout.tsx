import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase, 
  User,
  LogOut,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../../../store/store";
import { logout } from "../../../../store/authSlice";
import {
  clearTechnicianData,
  fetchTechnicianStart,
  fetchTechnicianSuccess,
  fetchTechnicianFailure,
} from "../../../../store/technicianSlice";
import { useNotification } from "../../../hooks/useNotification";
import ConfirmModal from "../../Shared/ConfirmModal/ConfirmModal";
import LoaderFallback from "../../../components/LoaderFallback";

import { getTechnicianProfileStatus } from "../../../../infrastructure/repositories/technician/technicianProfileRepository";
import { technicianLogout } from "../../../../infrastructure/repositories/technician/technicianAuthRepository";
import NotificationBell from "./NotificationBell";
import { useTechnicianNotifications } from "../../../hooks/useTechnicianNotifications";
 
import { socketService, type JobRequestEvent } from "../../../../infrastructure/api/socketClient";
import { setIncomingJob } from "../../../../store/technicianBookingSlice";
import IncomingJobModal from "../Job/IncomingJobModal";
interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/technician", icon: LayoutDashboard },
  { label: "My Jobs", path: "/technician/jobs", icon: Briefcase },
  { label: "My Profile", path: "/technician/profile", icon: User },
];

interface SidebarContentProps {
  onLogoutClick: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ onLogoutClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const techProfile = useSelector((state: RootState) => state.technician.profile);

  const isActive = (path: string) => {
    if (path === "/technician" && location.pathname !== "/technician") return false;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-100/50">
        <div className="p-1.5 bg-blue-50 rounded-lg">
          <img src="/assets/logo.png" alt="Logo" className="h-6 w-6 object-contain" />
        </div>
        <span className="text-lg font-bold text-gray-900 tracking-tight">ServoFixo</span>
      </div>

      <div className="px-5 py-6">
        <div className="flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-gray-50/80 cursor-default">
          <div className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-blue-600 font-bold text-sm overflow-hidden shrink-0 ring-2 ring-gray-50">
            {techProfile?.avatarUrl ? (
              <img src={techProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              (authUser?.email?.slice(0, 2).toUpperCase() || "TC")
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {techProfile?.name || "Partner"}
            </p>
            <p className="text-xs text-gray-500 truncate font-medium">
              {authUser?.email}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 mt-2">
          Main Menu
        </p>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden ${active
                  ? "bg-blue-50/80 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <item.icon
                strokeWidth={2}
                className={`w-5 h-5 transition-colors ${active ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                  }`}
              />
              {item.label}
              {active && (
                <div className="w-1 h-4 bg-blue-600 rounded-full absolute right-0 top-1/2 -translate-y-1/2 mr-1"></div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onLogoutClick}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" strokeWidth={2} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

const TechnicianLayout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { showSuccess, showError } = useNotification();
  const location = useLocation();

  //   Pulling state and hooks
  const { profile, loading } = useSelector((state: RootState) => state.technician);
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const { fetchNotifications } = useTechnicianNotifications(); //
  //   Corrected: Fetch notifications once globally when accessToken is available
useEffect(() => {
    if (accessToken) {
      fetchNotifications(); // Fetches history and starts Socket.io listener
    }
  }, [accessToken, fetchNotifications]);

useEffect(() => {
    if (accessToken && !profile) {
      const loadProfile = async () => {
        dispatch(fetchTechnicianStart());
        try {
          const data = await getTechnicianProfileStatus();
          dispatch(fetchTechnicianSuccess(data));
        } catch  {
          dispatch(fetchTechnicianFailure("Failed to load profile"));
        }
      };
      loadProfile();
    }
  }, [accessToken, profile, dispatch]);
  // Inside TechnicianLayout component, before return:

  // --- NEW: LISTEN FOR JOBS ---
  useEffect(() => {
    const userId = accessToken ? JSON.parse(atob(accessToken.split('.')[1])).id : null; // Decode or use auth user id

    // Safety check: ensure socket is connected (it should be via useTechnicianNotifications, but safe to verify)
    if (userId) {// Listener for Flow A [cite: 208]
       socketService.onJobRequest((data: JobRequestEvent) => { 
           
           // Dispatch to Redux to trigger the Modal
           dispatch(setIncomingJob({
               bookingId: data.bookingId,
               serviceName: data.serviceName,
               earnings: data.earnings,
               distance: data.distance,
               address: data.address,
               expiresAt: data.expiresAt
           }));
           
           // Optional: Play Sound here
       });
    }
    
    // Cleanup not strictly necessary here as Layout persists, but good practice if unmounted
    return () => {
        //socketService.offJobRequest(); // (If you implement offJobRequest in socketClient)
    };
  }, [dispatch, accessToken]);

  const isActive = (path: string) => {
    if (path === "/technician" && location.pathname !== "/technician") return false;
    return location.pathname.startsWith(path);
  };

  const activeItem = NAV_ITEMS.find(i => isActive(i.path)) || NAV_ITEMS[0];

  const handleLogoutConfirm = async () => {
    try {
      await technicianLogout();
    } catch {
      showError("Logout failed, please try again");
    } finally {
      dispatch(logout());
      dispatch(clearTechnicianData());
      showSuccess("Logged out successfully");
      setIsLogoutModalOpen(false);
      navigate("/technician/login");
    }
  };

  if (loading && !profile) return <LoaderFallback />;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans text-gray-900">
      <aside className="hidden md:block w-64 fixed inset-y-0 left-0 z-30">
        <SidebarContent onLogoutClick={() => setIsLogoutModalOpen(true)} />
      </aside>

      <div className="md:hidden bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 h-16 flex items-center justify-between sticky top-0 z-40 shadow-sm transition-all">
        <div className="flex items-center gap-3">
          <img src="/assets/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
          <span className="text-lg font-bold text-gray-900 tracking-tight">ServoFixo</span>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors active:scale-95"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <main className="flex-1 md:ml-64 min-h-screen pb-24 md:pb-0 pt-0">
        <header className="hidden md:flex h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm text-blue-600">
              <activeItem.icon className="w-5 h-5" strokeWidth={2} />
            </div>
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">
              {activeItem.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-6 w-px bg-gray-200 mx-1"></div>
            <NotificationBell/>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
          <Outlet />
        </div>
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center px-2">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`group flex flex-col items-center justify-center w-full py-3 space-y-1 transition-all duration-200 ${active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                  }`}
              >
                <div className={`relative p-1 rounded-full transition-all duration-300 ${active ? "bg-blue-50 transform -translate-y-1" : ""
                  }`}>
                  <item.icon
                    className={`w-6 h-6 ${active ? "fill-blue-600 text-blue-600" : ""}`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                </div>
                <span className={`text-[10px] font-semibold transition-colors ${active ? "text-blue-600" : "text-gray-500"
                  }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
      />
      <IncomingJobModal />
    </div>
  );
};

export default TechnicianLayout;