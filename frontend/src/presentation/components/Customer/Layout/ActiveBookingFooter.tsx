import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';
import type { RootState } from '../../../../store/store';

const ActiveBookingFooter: React.FC = () => {
    const navigate = useNavigate();
    const { activeBookingId, activeBookingStatus } = useSelector((state: RootState) => state.customer);

    if (!activeBookingId) return null;

    return (
        <div 
            onClick={() => navigate(`/booking/${activeBookingId}/track`)}
            className="fixed bottom-[80px] left-4 right-4 bg-blue-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-slide-up cursor-pointer z-[60] border border-blue-400 md:bottom-6 md:max-w-md md:left-auto"
        >
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full animate-pulse">
                    <Clock size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-bold uppercase opacity-80 tracking-wider">Active Service</p>
                    <p className="text-sm font-bold truncate">Status: {activeBookingStatus?.replace("_", " ")}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">Track Now</span>
                <ChevronRight size={18} />
            </div>
        </div>
    );
};

export default ActiveBookingFooter;