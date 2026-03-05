import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, CreditCard, CalendarDays } from 'lucide-react';
import type { RootState } from '../../../../store/store';
import { getBookingById } from '../../api/customerBookingRepository';

const ActiveBookingFooter: React.FC = () => {
    const navigate = useNavigate();
    const { activeBookingId, activeBookingStatus } = useSelector((state: RootState) => state.customer);
    
    // Local state to check if it's a future job
    const [isFuture, setIsFuture] = useState(false);
 
    useEffect(() => {
        const checkSchedule = async () => {
            if (activeBookingId && activeBookingStatus === 'ACCEPTED') {
                try {
                    const data = await getBookingById(activeBookingId);
                    if (data.timestamps?.scheduledAt) {
                        const schedTime = new Date(data.timestamps.scheduledAt).getTime();
                        if (schedTime > Date.now()) {
                            setIsFuture(true);
                        } else {
                            setIsFuture(false);
                        }
                    }
                } catch (e) {
                    console.error(e);
                }
            } else {
                setIsFuture(false);
            }
        };
        checkSchedule();
    }, [activeBookingId, activeBookingStatus]);

    if (!activeBookingId || activeBookingStatus === 'PAID' || activeBookingStatus === 'CANCELLED' || activeBookingStatus === 'FAILED_ASSIGNMENT' ) {
        return null;
    }
 
    if (activeBookingStatus === 'COMPLETED') {
        return (
            <div 
                onClick={() => navigate(`/booking/${activeBookingId}/track`)}
                className="fixed bottom-[80px] left-4 right-4 bg-green-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-slide-up cursor-pointer z-[60] border border-green-400 md:bottom-6 md:max-w-md md:left-auto"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full animate-bounce">
                        <CreditCard size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase opacity-90 tracking-wider">Payment Due</p>
                        <p className="text-sm font-bold truncate">Job Completed. Pay Now.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">Pay Bill</span>
                    <ChevronRight size={18} />
                </div>
            </div>
        );
    }
 
    // --- HYBRID FIX: UPCOMING VS ACTIVE FOOTER ---
    if (isFuture) {
        return (
            <div 
                onClick={() => navigate(`/booking/${activeBookingId}/track`)}
                className="fixed bottom-[80px] left-4 right-4 bg-slate-800 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-slide-up cursor-pointer z-[60] border border-slate-700 md:bottom-6 md:max-w-md md:left-auto"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-white/10 p-2 rounded-full">
                        <CalendarDays size={20} className="text-blue-300" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase opacity-60 tracking-wider">Upcoming Appointment</p>
                        <p className="text-sm font-bold truncate">Scheduled Service</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full">View</span>
                    <ChevronRight size={18} />
                </div>
            </div>
        );
    }

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