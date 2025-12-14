import React, { useEffect, useRef, useState } from "react";
import { MapPin, Search, Bell, User, ChevronDown, Menu, X, LogIn, LogOut, Home, Briefcase, Info, ChevronRight } from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../../store/store";
import { logout } from "../../../../store/authSlice";
import { customerLogout } from "../../../../infrastructure/repositories/authRepository";

const useCurrentUser = () => {
    const { profile } = useSelector((state: RootState) => state.customer);
    return {
        name: profile?.name || "Guest User",
        email: profile?.email || "Welcome to ServoFixo",
        phone: profile?.phone || 'N/A',
        avatarUrl: profile?.avatarUrl,
    };
};

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    const { accessToken } = useSelector((state: RootState) => state.auth);
    const isLoggedIn = !!accessToken;
    const user = useCurrentUser();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [query, setQuery] = useState("");
    const drawerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const urlSearch = searchParams.get('search');
        if (location.pathname === '/services' && urlSearch) {
            setQuery(urlSearch);
        } else if (location.pathname !== '/services') {
            setQuery('');
        }
    }, [searchParams, location.pathname]);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setDrawerOpen(false);
        }
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

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (query.trim()) {
            navigate(`/services?search=${encodeURIComponent(query)}`);
            setDrawerOpen(false);
        } else {
            navigate('/services');
            setDrawerOpen(false);
        }
    };

    const handleLogout = async () => {
        try {
            await customerLogout();
        } catch (err) {
            console.warn("Logout failed:", err);
        } finally {
            dispatch(logout());
            localStorage.removeItem("accessToken");
            sessionStorage.removeItem("otpFlowData");
            setDrawerOpen(false);
            navigate("/login");
        }
    };

    const isActive = (path: string) => {
        if (path === "/") return location.pathname === "/";
        return location.pathname.startsWith(path);
    };

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* --- MOBILE LAYOUT --- */}
                <div className="flex flex-col gap-3 py-3 md:hidden">
                    <div className="flex items-start justify-between gap-3">
                        <button onClick={() => setDrawerOpen(true)} className="mt-1 p-1 rounded-md hover:bg-gray-100">
                            <Menu size={24} className="text-gray-700" />
                        </button>

                        <div className="flex-1 min-w-0">
                            <button className="flex items-center gap-2 w-full text-left group">
                                <MapPin size={18} className="text-blue-600 flex-shrink-0" />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-gray-900 text-sm truncate">
                                            {isLoggedIn ? user.name : "Guest"}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        </div>

                        <div className="flex items-center gap-3 ml-3">
                            {isLoggedIn ? (
                                <IconButton icon={Bell} onClick={() => { }} badge />
                            ) : (
                                <button onClick={() => navigate("/login")} className="text-xs font-bold text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg">
                                    Login
                                </button>
                            )}
                        </div>
                    </div>

                    <SearchBar query={query} setQuery={setQuery} onSubmit={handleSearch} className="w-full" />
                </div>

                {/* --- DESKTOP LAYOUT --- */}
                <div className="hidden md:flex items-center h-20 justify-between gap-6">
                    <div className="flex items-center gap-8 lg:gap-12">
                        <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate("/")}>
                            <img src="/assets/logo.png" alt="ServoFixo" className="h-12 w-auto object-contain" />
                        </div>
                        <nav className="flex items-center gap-6">
                            <NavLink label="Home" path="/" active={isActive("/")} onClick={() => navigate("/")} />
                            <NavLink label="Services" path="/services" active={isActive("/services")} onClick={() => navigate("/services")} />
                            <NavLink label="About" path="/about" active={isActive("/about")} onClick={() => navigate("/about")} />
                        </nav>
                    </div>

                    <div className="flex items-center gap-4 flex-1 justify-end">
                        <button className="hidden lg:flex items-center gap-2 bg-[#F3F4F6] rounded-full px-4 py-2.5 transition-colors cursor-pointer hover:bg-gray-200">
                            <MapPin size={18} className="text-gray-600" />
                            <span className="text-sm font-semibold text-gray-700">Madiwala, Bangalore</span>
                            <ChevronDown size={14} className="text-gray-400" />
                        </button>

                        <div className="flex-1 max-w-md hidden md:block">
                            <SearchBar query={query} setQuery={setQuery} onSubmit={handleSearch} />
                        </div>

                        <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                            {isLoggedIn ? (
                                <>
                                    <IconButton icon={Bell} onClick={() => { }} badge />
                                    <ProfileAvatar onClick={() => navigate("/profile")} />
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut size={20} />
                                    </button>
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

            {/* --- STYLED MOBILE DRAWER --- */}

            {drawerOpen && (
                <div className="fixed inset-0 z-[100]">

                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setDrawerOpen(false)}
                    />

                    {/* Drawer Container */}
                    <aside
                        ref={drawerRef}
                        className="absolute left-0 top-0 h-full w-[280px] bg-white shadow-2xl flex flex-col animate-slide-in-left"
                    >

                        {/* 1. Header Section */}
                        <div className="bg-blue-600 p-6 text-white relative overflow-hidden shrink-0">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <img src="/assets/logo.png" className="w-24 h-24" alt="bg-logo" />
                            </div>

                            <div className="relative z-10 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xl shadow-md">
                                        {isLoggedIn ? user.name.charAt(0).toUpperCase() : <User size={24} />}
                                    </div>
                                    <button
                                        onClick={() => setDrawerOpen(false)}
                                        className="bg-white/20 p-1.5 rounded-full hover:bg-white/30 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <div>
                                    <h3 className="font-bold text-lg truncate">{user.name}</h3>
                                    <p className="text-blue-100 text-xs truncate">
                                        {isLoggedIn ? user.email : "Sign in to access more"}
                                    </p>
                                    <p className="text-blue-100 text-xs truncate">
                                        {isLoggedIn ? user.phone : "Sign in to access more"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Scrollable Menu Items */}
                        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 pb-20">
                            <DrawerItem icon={Home} label="Home" onClick={() => { navigate("/"); setDrawerOpen(false); }} active={isActive('/')} />
                            <DrawerItem icon={Briefcase} label="Services" onClick={() => { navigate("/services"); setDrawerOpen(false); }} active={isActive('/services')} />
                            <DrawerItem icon={Info} label="About Us" onClick={() => { navigate("/about"); setDrawerOpen(false); }} active={isActive('/about')} />

                            <div className="my-4 border-t border-gray-100"></div>

                            {isLoggedIn && (
                                <DrawerItem icon={User} label="My Profile" onClick={() => { navigate("/profile"); setDrawerOpen(false); }} active={isActive('/profile')} />
                            )}
                        </div>

                        {/* 3. Bottom Actions (Logout / Login) */}
                        <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0">
                            {isLoggedIn ? (
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all shadow-sm mb-11"
                                >
                                    <LogOut size={18} /> Logout
                                </button>
                            ) : (
                                <button
                                    onClick={() => { navigate("/login"); setDrawerOpen(false); }}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md mb-11"
                                >
                                    <LogIn size={18} /> Login / Register
                                </button>
                            )}

                            <div className="text-center mt-4">
                                <p className="text-[10px] text-gray-400">ServoFixo v1.0.0</p>
                            </div>
                        </div>

                    </aside>
                </div>
            )}
        </header>
    );
};
 
const SearchBar = ({ query, setQuery, onSubmit, className = "" }: any) => (
    <form onSubmit={onSubmit} className={`flex items-center gap-3 bg-[#F3F4F6] rounded-full px-4 py-2.5 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white focus-within:shadow-md ${className}`}>
        <Search size={18} className="text-gray-400 flex-shrink-0" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search services..." className="bg-transparent border-none outline-none text-sm font-medium text-gray-700 w-full placeholder:text-gray-400" />
    </form>
);

const NavLink = ({ label, active, onClick }: any) => (
    <button onClick={onClick} className={`text-sm font-bold transition-colors ${active ? "text-blue-600" : "text-gray-600 hover:text-black"}`}>{label}</button>
);

const IconButton = ({ icon: Icon, onClick, badge }: any) => (
    <button onClick={onClick} className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900">
        <Icon size={20} />
        {badge && <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />}
    </button>
);

const ProfileAvatar = ({ onClick }: any) => (
    <button onClick={onClick} className="p-1 rounded-full border border-transparent hover:border-gray-200 transition-all">
        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"><User size={18} /></div>
    </button>
);

const DrawerItem = ({ icon: Icon, label, onClick, active }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${active
            ? "bg-blue-50 text-blue-600"
            : "text-gray-700 hover:bg-gray-100"
            }`}
    >
        <Icon size={20} className={active ? "text-blue-600" : "text-gray-500"} />
        <span className="flex-1 text-left">{label}</span>
        <ChevronRight size={16} className={`text-gray-300 ${active ? "text-blue-400" : ""}`} />
    </button>
);

export default Navbar;