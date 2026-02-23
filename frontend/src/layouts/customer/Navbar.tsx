import React, { useEffect, useRef, useState } from "react";
import { MapPin, Search,  User, ChevronDown, Menu, X, LogIn, LogOut, Home, Briefcase, Info, ChevronRight, type LucideIcon } from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store/store";
import { logout } from "../../store/authSlice";
import {
    fetchProfileStart,
    fetchProfileSuccess,
    fetchProfileFailure,
    setCurrentLocation,
    setAddresses, 
    clearCustomerData,
    setActiveBooking,       
    setActiveTechnician     
} from "../../store/customerSlice";
import { 
    getProfile, 
    getZoneByLocation, 
    getMyAddresses 
} from "../../features/profile/api/customerRepository";
import { getActiveBooking } from "../../features/booking/api/customerBookingRepository"; 
import { customerLogout } from "../../features/auth/api/authRepository";
import ConfirmModal from "../../components/Shared/ConfirmModal/ConfirmModal";
import LocationPickerModal from "./LocationPickerModal";
import NotificationBell from "../../features/notifications/components/NotificationBell";
import ActiveBookingFooter from "../../features/booking/components/customer/ActiveBookingFooter" 
import { useCustomerNotifications } from "../../features/notifications/hooks/useCustomerNotifications";

const useCurrentUser = () => {
    const { profile, currentLocationName } = useSelector((state: RootState) => state.customer);
    return {
        name: profile?.name || "Guest User",
        email: profile?.email || "Welcome to ServoFixo",
        phone: profile?.phone || 'N/A',
        avatarUrl: profile?.avatarUrl,
        location: currentLocationName,
    };
};

const Navbar: React.FC = () => {
    useCustomerNotifications();

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    const { accessToken } = useSelector((state: RootState) => state.auth);
    const isLoggedIn = !!accessToken;
    const { profile, activeBookingId } = useSelector((state: RootState) => state.customer); 
    const user = useCurrentUser();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement | null>(null);
    const drawerRef = useRef<HTMLDivElement | null>(null);

    const triggerGeolocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const zoneName = await getZoneByLocation(latitude, longitude);
                        dispatch(setCurrentLocation({
                            name: zoneName,
                            coords: { lat: latitude, lng: longitude },
                            isManual: false
                        }));
                    } catch {
                        dispatch(setCurrentLocation("Location Error"));
                    }
                },
                () => dispatch(setCurrentLocation("Location Denied"))
            );
        } else {
            dispatch(setCurrentLocation("GPS Not Supported"));
        }
    };

    useEffect(() => {
        if (isLoggedIn && !profile) {
            const loadInitialData = async () => {
                dispatch(fetchProfileStart());
                try {
                    const userData = await getProfile();
                    dispatch(fetchProfileSuccess(userData));

                    const addresses = await getMyAddresses();
                    dispatch(setAddresses(addresses));

                    const defaultAddr = addresses.find(a => a.isDefault && a.isServiceable);
                    if (defaultAddr) {
                        const zoneName = await getZoneByLocation(defaultAddr.location.lat, defaultAddr.location.lng);
                        dispatch(setCurrentLocation({
                            name: zoneName,
                            coords: defaultAddr.location,
                            isManual: true
                        }));
                    } else {
                        triggerGeolocation();
                    }
                } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : "Failed to load data";
                    dispatch(fetchProfileFailure(message));
                    triggerGeolocation();
                }
            };
            loadInitialData();
        } else if (!isLoggedIn) {
            triggerGeolocation();
        }
    }, [isLoggedIn, profile, dispatch]);
  
    useEffect(() => {
        if (isLoggedIn && !activeBookingId) {
            const fetchActiveJob = async () => {
                try { 
                    const booking = await getActiveBooking();
                    if (booking) { 
                        dispatch(setActiveBooking({ id: booking.id, status: booking.status }));
                        if (booking.snapshots?.technician) {
                            dispatch(setActiveTechnician({
                                name: booking.snapshots.technician.name,
                                phone: booking.snapshots.technician.phone,
                                photo: booking.snapshots.technician.avatarUrl,
                                vehicle: "",
                                otp: booking.meta?.otp
                            }));
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch active booking", err);
                }
            };
            fetchActiveJob();
        }
    }, [isLoggedIn, activeBookingId, dispatch]);

    useEffect(() => {
        const urlSearch = searchParams.get('search');
        if (location.pathname === '/services' && urlSearch) {
            setQuery(urlSearch);
        } else if (location.pathname !== '/services') {
            setQuery('');
        }
    }, [searchParams, location.pathname]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) { if (e.key === "Escape") setDrawerOpen(false); }
        function onClickOutside(e: MouseEvent) {
            if (drawerOpen && drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
                setDrawerOpen(false);
            }
        }
        window.addEventListener("keydown", onKey);
        window.addEventListener("mousedown", onClickOutside);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("mousedown", onClickOutside);
        };
    }, [drawerOpen]);
    
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (profileMenuOpen && profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
                setProfileMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [profileMenuOpen]);


    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        const path = query.trim() ? `/services?search=${encodeURIComponent(query)}` : '/services';
        navigate(path);
        setDrawerOpen(false);
    };

    //   NEW: Handles clearing the input AND resetting the search results
    const handleClearSearch = () => {
        setQuery(""); // Clear the text input
        
        // If we are currently on the services page with an active search, reset to show all services
        if (location.pathname === '/services' && searchParams.get('search')) {
            navigate('/services');
        }
    };

    const confirmLogout = async () => {
        setIsLoggingOut(true);
        try {
            await customerLogout();
        } catch (err) { console.warn("Logout failed:", err); } 
        finally {
            dispatch(logout());
            dispatch(clearCustomerData());
            localStorage.removeItem("accessToken");
            sessionStorage.removeItem("otpFlowData");
            setLogoutModalOpen(false);
            setIsLoggingOut(false);
            navigate("/login");
        }
    };

    const isActive = (path: string) => path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
    const shouldShowFooter = !location.pathname.includes('/track') && !location.pathname.includes('/booking/');

    return (
        <>
            <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

                    {/* --- MOBILE LAYOUT --- */}
                    <div className="flex flex-col gap-3 py-3 md:hidden">
                        <div className="flex items-start justify-between gap-3">
                            <button onClick={() => setDrawerOpen(true)} className="mt-1 p-1 rounded-md hover:bg-gray-100">
                                <Menu size={24} className="text-gray-700" />
                            </button>

                            <div className="flex-1 min-w-0">
                                <button onClick={() => setLocationModalOpen(true)} className="flex items-center gap-2 w-full text-left group">
                                    <MapPin size={18} className="text-blue-600 flex-shrink-0" />
                                    <span className="font-bold text-gray-900 text-sm truncate">{user.location}</span>
                                    <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 ml-3">
                                {isLoggedIn ? (
                                    <NotificationBell />
                                ) : (
                                    <button onClick={() => navigate("/login")} className="text-xs font-bold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg">Login</button>
                                )}
                            </div>
                        </div>
                        {/*   Passed handleClearSearch */}
                        <SearchBar query={query} setQuery={setQuery} onSubmit={handleSearch} onClear={handleClearSearch} className="w-full" />
                    </div>

                    {/* --- DESKTOP LAYOUT --- */}
                    <div className="hidden md:flex items-center h-20 justify-between gap-6">
                        <div className="flex items-center gap-8 lg:gap-12">
                            <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate("/")}>
                                <img src="/assets/logo.png" alt="ServoFixo" className="h-12 w-auto object-contain" />
                            </div>
                            <nav className="flex items-center gap-6">
                                <NavLink label="Home" active={isActive("/")} onClick={() => navigate("/")} />
                                <NavLink label="Services" active={isActive("/services")} onClick={() => navigate("/services")} />
                                <NavLink label="About" active={isActive("/about")} onClick={() => navigate("/about")} />
                            </nav>
                        </div>

                        <div className="flex items-center gap-4 flex-1 justify-end">
                            <button onClick={() => setLocationModalOpen(true)} className="hidden lg:flex items-center gap-2 bg-[#F3F4F6] rounded-full px-4 py-2.5 hover:bg-gray-200 transition-colors">
                                <MapPin size={18} className="text-blue-600" />
                                <span className="text-sm font-bold text-gray-700">{user.location}</span>
                                <ChevronDown size={14} className="text-gray-400" />
                            </button>

                            <div className="flex-1 max-w-md hidden md:block">
                                {/*   Passed handleClearSearch */}
                                <SearchBar query={query} setQuery={setQuery} onSubmit={handleSearch} onClear={handleClearSearch} />
                            </div>

                            <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                                {isLoggedIn ? (
                                    <>
                                        <NotificationBell />
                                        <div ref={profileMenuRef} className="relative">
                                            <button onClick={() => setProfileMenuOpen(prev => !prev)} className="p-1 rounded-full border border-transparent hover:border-gray-200 transition-all">
                                                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                                    <User size={18} />
                                                </div>
                                            </button>
                                            {profileMenuOpen && (
                                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                                                    <div className="px-4 py-3 border-b border-gray-100">
                                                        <p className="font-bold text-sm text-gray-900 truncate">{user.name}</p>
                                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                                    </div>
                                                    <button onClick={() => { navigate("/profile"); setProfileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                                        <User size={16} /> My Profile
                                                    </button>
                                                    <button onClick={() => { setLogoutModalOpen(true); setProfileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50">
                                                        <LogOut size={16} /> Logout
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <button onClick={() => navigate("/login")} className="flex items-center gap-2 bg-blue-600 hover:bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all">
                                        <LogIn size={16} /> <span>Login</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- MOBILE DRAWER --- */}
                {drawerOpen && (
                    <div className="fixed inset-0 z-[100]">
                        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
                        <aside ref={drawerRef} className="absolute left-0 top-0 h-full w-[280px] bg-white shadow-2xl flex flex-col animate-slide-in-left">
                            <div className="bg-blue-600 p-6 text-white relative overflow-hidden shrink-0">
                                <div className="relative z-10 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xl shadow-md">
                                            {isLoggedIn ? user.name.charAt(0).toUpperCase() : <User size={24} />}
                                        </div>
                                        <button onClick={() => setDrawerOpen(false)} className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors"><X size={18} /></button>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg truncate">{user.name}</h3>
                                        <p className="text-blue-100 text-xs truncate">{isLoggedIn ? user.email : "Sign in to access more"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 pb-20">
                                <DrawerItem icon={Home} label="Home" onClick={() => { navigate("/"); setDrawerOpen(false); }} active={isActive('/')} />
                                <DrawerItem icon={Briefcase} label="Services" onClick={() => { navigate("/services"); setDrawerOpen(false); }} active={isActive('/services')} />
                                <DrawerItem icon={Info} label="About Us" onClick={() => { navigate("/about"); setDrawerOpen(false); }} active={isActive('/about')} />
                                <div className="my-4 border-t border-gray-100"></div>
                                {isLoggedIn && (
                                    <DrawerItem icon={User} label="My Profile" onClick={() => { navigate("/profile"); setDrawerOpen(false); }} active={isActive('/profile')} />
                                )}
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0">
                                {isLoggedIn ? (
                                    <button onClick={() => setLogoutModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 py-3 rounded-xl font-semibold mb-12 shadow-sm hover:bg-red-50">
                                        <LogOut size={18} /> Logout
                                    </button>
                                ) : (
                                    <button onClick={() => { navigate("/login"); setDrawerOpen(false); }} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold mb-12 shadow-md hover:bg-blue-700">
                                        <LogIn size={18} /> Login / Register
                                    </button>
                                )}
                            </div>
                        </aside>
                    </div>
                )}

                <LocationPickerModal isOpen={locationModalOpen} onClose={() => setLocationModalOpen(false)} />
                <ConfirmModal isOpen={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} onConfirm={confirmLogout} title="Confirm Logout" message="Are you sure you want to log out?" confirmText="Yes, Logout" isLoading={isLoggingOut} />
            </header>
            
            {shouldShowFooter && <ActiveBookingFooter />}
        </>
    );
};

//   UPDATED SearchBar: Accepts onClear prop
interface SearchBarProps { 
    query: string; 
    setQuery: (query: string) => void; 
    onSubmit: (e?: React.FormEvent) => void; 
    onClear?: () => void; // New optional prop
    className?: string; 
}

const SearchBar: React.FC<SearchBarProps> = ({ query, setQuery, onSubmit, onClear, className = "" }) => (
    <form onSubmit={onSubmit} className={`flex items-center gap-3 bg-[#F3F4F6] rounded-full px-4 py-2.5 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white focus-within:shadow-md ${className}`}>
        <Search size={18} className="text-gray-400 flex-shrink-0" />
        <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Search services..." 
            className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 w-full" 
        />
        {query && (
            <button 
                type="button"
                //   Logic: Call onClear if provided, otherwise default to just clearing text
                onClick={() => {
                    if (onClear) {
                        onClear();
                    } else {
                        setQuery("");
                    }
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full hover:bg-gray-200"
            >
                <X size={16} />
            </button>
        )}
    </form>
);

interface NavLinkProps { label: string; active: boolean; onClick: () => void; }
const NavLink: React.FC<NavLinkProps> = ({ label, active, onClick }) => (
    <button onClick={onClick} className={`text-sm font-bold transition-colors ${active ? "text-blue-600" : "text-gray-600 hover:text-black"}`}>{label}</button>
);

interface DrawerItemProps { icon: LucideIcon; label: string; onClick: () => void; active: boolean; }
const DrawerItem: React.FC<DrawerItemProps> = ({ icon: Icon, label, onClick, active }) => (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${active ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}>
        <Icon size={20} className={active ? "text-blue-600" : "text-gray-500"} />
        <span className="flex-1 text-left">{label}</span>
        <ChevronRight size={16} className={`text-gray-300 ${active ? "text-blue-400" : ""}`} />
    </button>
);

export default Navbar;