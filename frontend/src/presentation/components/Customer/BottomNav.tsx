import React from 'react';
import { Home, ShoppingBag, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    // ✅ Visible only on mobile
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <NavButton icon={Home} label="Home" active={isActive('/customer/home')} onClick={() => navigate('/customer/home')} />
      <NavButton icon={ShoppingBag} label="Bookings" active={isActive('/customer/bookings')} onClick={() => navigate('/customer/bookings')} />
      <NavButton icon={User} label="Profile" active={isActive('/customer/profile')} onClick={() => navigate('/customer/profile')} />
    </div>
  );
};

const NavButton = ({ icon: Icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all duration-200 ${active ? "text-blue-600 scale-105" : "text-gray-400 hover:text-gray-600"}`}>
    <Icon size={22} className={active ? "fill-blue-600/10 stroke-[2.5px]" : "stroke-[2px]"} />
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default BottomNav;