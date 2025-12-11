import React, { useEffect, useRef, useState } from "react";
import { MapPin, Search, Bell, User, ChevronDown} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Mock User Hook
const useCurrentUser = () => {
  return {
    name: "Christin Johny",
    address: "14, S R Mansion, Tavarekere, Rama...",
    avatar: null,
  };
};

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useCurrentUser();
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const drawerRef = useRef<HTMLDivElement | null>(null);

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
      navigate(`/customer/search?q=${encodeURIComponent(query)}`);
      setDrawerOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-sm border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* --- MOBILE LAYOUT (md:hidden) --- */}
        <div className="flex flex-col gap-3 py-3 md:hidden">
          <div className="flex items-start justify-between gap-3">
            {/* Location / User Info */}
            <div className="flex-1 min-w-0">
              <button
                className="flex items-center gap-2 w-full text-left group"
                aria-label="Change Location"
              >
                <MapPin size={18} className="text-blue-600 flex-shrink-0 group-active:scale-95 transition-transform" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-gray-900 text-sm truncate">{user.name}</span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 truncate">{user.address}</p>
                </div>
              </button>
            </div>

            {/* Right Icons (Profile HIDDEN on mobile) */}
            <div className="flex items-center gap-3 ml-3">
              <IconButton icon={Bell} onClick={() => {}} badge />
              {/* Profile is in BottomNav, so hidden here */}
            </div>
          </div>

          {/* Mobile Search Bar */}
          <SearchBar 
            query={query} 
            setQuery={setQuery} 
            onSubmit={handleSearch} 
            className="w-full"
          />
        </div>

        {/* --- DESKTOP LAYOUT (hidden md:flex) --- */}
        <div className="hidden md:flex items-center h-20 justify-between gap-6">
          
          {/* Logo & Nav */}
          <div className="flex items-center gap-8 lg:gap-12">
            <div 
              className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/customer/home")}
            >
              <img src="/assets/logo.png" alt="ServoFixo" className="h-14 w-auto object-contain" />
            </div>

            <nav className="flex items-center gap-6">
              <NavLink label="Home" path="/customer/home" active={isActive("/customer")} onClick={() => navigate("/customer")} />
              <NavLink label="Services" path="/customer/services" active={isActive("/customer/services")} onClick={() => navigate("/customer/services")} />
              <NavLink label="About" path="/customer/about" active={isActive("/customer/about")} onClick={() => navigate("/customer/about")} />
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <button className="hidden lg:flex items-center gap-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] rounded-full px-4 py-2.5 transition-colors cursor-pointer group">
              <MapPin size={18} className="text-gray-600 group-hover:text-blue-500 transition-colors" />
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap max-w-[150px] truncate">
                Madiwala, Bangalore
              </span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            <div className="flex-1 max-w-md hidden md:block">
              <SearchBar query={query} setQuery={setQuery} onSubmit={handleSearch} />
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <IconButton icon={Bell} onClick={() => {}} badge />
              {/* Profile visible on Desktop */}
              <ProfileAvatar onClick={() => navigate("/customer/profile")} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Optional - kept for completeness) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setDrawerOpen(false)} />
          <aside ref={drawerRef} className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl p-5 overflow-auto animate-slide-in-left flex flex-col">
             {/* Drawer Content */}
          </aside>
        </div>
      )}
    </header>
  );
};

// Sub-components (unchanged)
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

export default Navbar;