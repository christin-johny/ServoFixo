 
import React from 'react';
import { AlertCircle, ArrowRight, X } from 'lucide-react';

interface AlertCardProps {
    title: string;
    reason: string;
    detail?: string; //   New prop for Service/Zone names
    onFix: () => void;
    onDismiss: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ title, reason, detail, onFix, onDismiss }) => {
    return (
        <div className="bg-orange-100 border-l-4 border-l-red-500 border-y border-r border-gray-200 p-3 rounded-lg shadow-sm animate-in fade-in slide-in-from-top-1">
            <div className="flex items-start gap-3">
                <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Rejected</span>
                        <h4 className="text-xs font-bold text-gray-900 truncate">{title}</h4>
                    </div>
                    {/*   Detailed name of the rejected item */}
                    {detail && (
                        <p className="text-[11px] font-bold text-blue-600 mt-0.5 truncate">{detail}</p>
                    )}
                    <p className="text-[11px] text-gray-600 mt-1 line-clamp-2 leading-snug">
                        {reason}
                    </p>
                </div>
                <button 
                    onClick={onDismiss} 
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                    <X size={14} />
                </button>
            </div>
            
            <div className=" flex justify-end">
                <button
                    onClick={onFix}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors group"
                >
                    Fix & Resubmit 
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>
        </div>
    );
};