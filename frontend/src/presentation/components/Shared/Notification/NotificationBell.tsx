import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store/store';
import NotificationInbox from '../../Technician/Layout/NotificationInbox';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  //   Selector is working as per your logs
  const unreadCount = useSelector((state: RootState) => state.notifications.unreadCount);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 relative group"
      >
        {/*   Dynamic Classes: blue color and ringing animation if count > 0 */}
        <Bell 
          className={`w-6 h-6 transition-all ${
            unreadCount > 0 
              ? 'text-blue-600 animate-bell drop-shadow-[0_0_8px_rgba(37,99,235,0.4)]' 
              : 'text-gray-400'
          }`} 
          strokeWidth={unreadCount > 0 ? 2.5 : 2} 
        />
        
        {/*   Red Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full ring-2 ring-white flex items-center justify-center animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && <NotificationInbox onClose={() => setIsOpen(false)} />}
    </div>
  );
};

export default NotificationBell;