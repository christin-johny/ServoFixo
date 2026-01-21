import React, { useState, useMemo } from 'react';
import { X, CheckCheck, Inbox, BellRing, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTechnicianNotifications } from '../../../hooks/useTechnicianNotifications';
import { formatDistanceToNow } from 'date-fns';

interface Props { onClose: () => void; }

const NotificationInbox: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'unread' | 'all'>('unread');
  const { 
    notifications, 
    unreadCount, 
    loading, 
    handleMarkAsRead, 
    handleMarkAllRead 
  } = useTechnicianNotifications();

  // ✅ Memoized filtering for industrial performance
  const displayedNotifications = useMemo(() => {
    return activeTab === 'unread' 
      ? notifications.filter(n => n.status === 'UNREAD') 
      : notifications;
  }, [notifications, activeTab]);

  const handleItemClick = async (notifId: string, actionPath?: string) => {
    await handleMarkAsRead(notifId);
    if (actionPath) {
      navigate(actionPath);
      onClose();
    }
  };

  return (
    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden ring-1 ring-black/5 animate-fade-in">
      {/* Header & Navigation */}
      <div className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <BellRing size={16} className="text-blue-600" />
            Notifications
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Industrial Tab Switcher */}
        <div className="flex bg-gray-200/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
              activeTab === 'unread' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white px-1.5 rounded-full text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2 ${
              activeTab === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All History
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {loading && displayedNotifications.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm italic">Loading...</div>
        ) : displayedNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <Inbox size={24} />
            </div>
            <p className="text-gray-500 text-xs font-semibold">
              {activeTab === 'unread' ? 'Zero unread notifications' : 'Your history is empty'}
            </p>
          </div>
        ) : (
          displayedNotifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => handleItemClick(notif.id, notif.clickAction)}
              className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-slate-50 relative group ${
                notif.status === 'UNREAD' ? 'bg-blue-50/20' : ''
              }`}
            >
              <div className="flex justify-between items-start gap-3 mb-1.5">
                <h4 className={`text-xs font-bold leading-tight ${notif.status === 'UNREAD' ? 'text-blue-900' : 'text-gray-700'}`}>
                  {notif.title}
                </h4>
                <div className="flex items-center gap-1 text-gray-400 shrink-0">
                  <Clock size={10} />
                  <span className="text-[10px] whitespace-nowrap">
                    {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : ''}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">
                {notif.body}
              </p>
              {notif.status === 'UNREAD' && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Controls */}
      {unreadCount > 0 && (
        <button 
          onClick={handleMarkAllRead}
          className="w-full py-3 bg-gray-50 hover:bg-blue-50 text-[11px] font-bold text-blue-600 transition-colors border-t border-gray-100 flex items-center justify-center gap-2"
        >
          <CheckCheck size={14} />
          Mark all as read
        </button>
      )}
    </div>
  );
};

export default NotificationInbox;