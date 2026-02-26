import React from 'react';
import {  Calendar, Bot, ChevronRight } from 'lucide-react';
import { type ChatSession } from '../types/ChatTypes';

interface Props {
  session: ChatSession;
  onOpen: (session: ChatSession) => void;
}
const ConsultationCard: React.FC<Props> = ({ session, onOpen }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };
 
  const displaySummary = session.status === 'ACTIVE' 
    ? "Session is still active..." 
    : session.summaryText;

  return (
    <div 
      onClick={() => onOpen(session)}
      className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between gap-4"
    >
      <div className="flex gap-4 items-center flex-1 min-w-0">
        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
          <Bot className="text-gray-500 group-hover:text-white transition-colors" size={24} />
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-gray-900 text-sm md:text-base truncate">
              {displaySummary}
            </h4>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border shrink-0 ${
              session.status === 'RESOLVED' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'
            }`}>
              {session.status}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-gray-500">
            <Calendar size={12} />
            <span>{formatDate(session.createdAt)}</span>
          </div>
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
    </div>
  );
};
export default ConsultationCard;