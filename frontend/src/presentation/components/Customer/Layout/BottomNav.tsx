import React from 'react';
import { Home, ShoppingBag, User, LogIn, type LucideIcon } from 'lucide-react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store/store'; 

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
   
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const isLoggedIn = !!accessToken;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleAuthAction = (targetPath: string) => {
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      navigate(targetPath);
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <NavButton 
        icon={Home} 
        label="Home" 
        active={isActive('/')} 
        onClick={() => navigate('/')} 
      />
      <NavButton 
        icon={ShoppingBag} 
        label="Bookings" 
        active={isActive('/bookings')} 
        onClick={() => handleAuthAction('/bookings')} 
      />
      <NavButton 
        icon={isLoggedIn ? User : LogIn} 
        label={isLoggedIn ? "Profile" : "Login"} 
        active={isActive(isLoggedIn ? '/profile' : '/login')} 
        onClick={() => navigate(isLoggedIn ? '/profile' : '/login')} 
      />
    </div>
  );
};

// ✅ STRICTLY TYPED PROPS
interface NavButtonProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center gap-1 transition-all duration-200 ${active ? "text-blue-600 scale-105" : "text-gray-400 hover:text-gray-600"}`}
  >
    <Icon size={22} className={active ? "fill-blue-600/10 stroke-[2.5px]" : "stroke-[2px]"} />
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

export default BottomNav;