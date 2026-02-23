import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar,  ChevronRight, User, Star, FileText } from 'lucide-react';
import {type BookingResponse } from '../../api/customerBookingRepository';

interface BookingHistoryCardProps {
  booking: BookingResponse;
  compact?: boolean;  
}

const BookingHistoryCard: React.FC<BookingHistoryCardProps> = ({ booking, compact = false }) => {
  const navigate = useNavigate();
 
  const getStatusColor = (status: string = '') => {  
    const s = status?.toUpperCase();  
    switch (s) {
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'PAID': return 'bg-green-100 text-green-700 border-green-200';
      case 'CANCELLED': return 'bg-red-50 text-red-600 border-red-100';
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };
 
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Added Optional Chaining to all logic
  const status = booking?.status || 'PENDING';
  const isCompleted = status === 'COMPLETED' || status === 'PAID';
  const isPaid = status === 'PAID';
  const serviceName = booking?.snapshots?.service?.name || 'Service';
  const techName = booking?.snapshots?.technician?.name;
  const price = booking?.pricing?.final || booking?.pricing?.estimated;
 
  const handleViewDetails = () => {
    if (isCompleted || status === 'CANCELLED') { 
        navigate(`/booking/${booking?.id}/details`); 
    } else {
        navigate(`/booking/${booking?.id}/track`);
    }
  };

  const handleRate = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/booking/${booking?.id}/rate`);
  };

  return (
    <div 
      onClick={handleViewDetails}
      className={`bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${compact ? 'p-4' : 'p-5'}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-4"> 
          <div className={`rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 ${compact ? 'w-12 h-12' : 'w-16 h-16'}`}>
            <FileText className="text-blue-500" size={compact ? 20 : 24} />
          </div>

          <div>
            <h4 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
              {serviceName}
            </h4>
            
            <div className="flex items-center gap-2 mt-1 text-gray-500 text-xs">
              <Calendar size={12} />
              <span>{formatDate(booking?.timestamps?.scheduledAt || booking?.timestamps?.createdAt)}</span>
            </div>

            {!compact && techName && (
               <div className="flex items-center gap-2 mt-1 text-gray-500 text-xs">
                 <User size={12} />
                 <span>{techName}</span>
               </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
            {/* Added null check for status.replace */}
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
            {status.replace('_', ' ')}
            </span>
            {!compact && price && (
                <span className="font-semibold text-gray-900 text-sm">₹{price}</span>
            )}
        </div>
      </div>

      {!compact && (
        <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end gap-3">
            {isPaid && !booking?.isRated && (
                <button 
                    onClick={handleRate}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                    <Star size={14} />
                    Rate Technician
                </button>
            )}
            
            <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                View Details <ChevronRight size={14} />
            </button>
        </div>
      )}
    </div>
  );
};

export default BookingHistoryCard;