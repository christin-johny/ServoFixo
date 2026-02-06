import React from "react";
import { format } from "date-fns";
import { CheckCircle2, Clock, XCircle, AlertCircle, Briefcase, User } from "lucide-react";
import { type BookingTimelineItem } from "../../../../infrastructure/repositories/admin/adminBookingRepository";

interface BookingTimelineProps {
  timeline: BookingTimelineItem[];
}

const BookingTimeline: React.FC<BookingTimelineProps> = ({ timeline }) => {
  if (!timeline || timeline.length === 0) {
    return <div className="text-gray-400 text-sm italic">No activity recorded yet.</div>;
  }

  // Helper to pick icons based on status/event
  const getIcon = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("COMPLETED") || s.includes("PAID")) return <CheckCircle2 size={16} className="text-white" />;
    if (s.includes("CANCELLED") || s.includes("REJECTED")) return <XCircle size={16} className="text-white" />;
    if (s.includes("IN_PROGRESS")) return <Briefcase size={16} className="text-white" />;
    if (s.includes("REQUESTED")) return <AlertCircle size={16} className="text-white" />;
    return <Clock size={16} className="text-white" />;
  };

  // Helper for background color
  const getBgColor = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("COMPLETED") || s.includes("PAID")) return "bg-green-500";
    if (s.includes("CANCELLED") || s.includes("REJECTED") || s.includes("FAILED")) return "bg-red-500";
    if (s.includes("IN_PROGRESS") || s.includes("ACCEPTED")) return "bg-blue-500";
    return "bg-gray-400";
  };

  return (
    <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
      {timeline.map((item, index) => (
        <div key={index} className="relative pl-8">
          
          {/* Timeline Dot */}
          <div className={`absolute -left-[9px] top-0 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ring-2 ring-gray-50 ${getBgColor(item.status)}`}>
            {getIcon(item.status)}
          </div>

          {/* Content */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
            <div>
              <p className="text-sm font-bold text-gray-900">
                {item.status.replace(/_/g, " ")}
              </p>
              {item.reason && (
                <p className="text-xs text-gray-500 mt-0.5">
                  "{item.reason}"
                </p>
              )}
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded w-fit">
                <User size={10} />
                <span className="truncate max-w-[150px]">{item.changedBy}</span>
              </div>
            </div>
            
            <span className="text-xs text-gray-400 font-mono whitespace-nowrap">
              {item.timestamp ? format(new Date(item.timestamp), "MMM d, p") : "N/A"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingTimeline;