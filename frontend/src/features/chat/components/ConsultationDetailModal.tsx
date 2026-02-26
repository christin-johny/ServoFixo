import React from 'react';
import { Bot, Calendar, X, ClipboardList, CheckCircle2 } from 'lucide-react';
import { type ChatSession } from '../types/ChatTypes';

interface Props {
    session: ChatSession | null;
    isOpen: boolean;
    onClose: () => void;
}

export const ConsultationDetailModal: React.FC<Props> = ({ session, isOpen, onClose }) => {
    if (!session || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl transform transition-all animate-scaleIn">
                {/* Header */}
                <div className="bg-blue-600 p-6 text-white relative">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl"><Bot size={24} /></div>
                        <div>
                            <h2 className="text-xl font-bold leading-tight">Consultation Summary</h2>
                            <p className="text-blue-100 text-xs mt-1 flex items-center gap-1">
                                <Calendar size={12} /> {new Date(session.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Summary Overview */}
                   <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <ClipboardList size={14} /> AI Overview
                        </h3>
                        <p className="text-gray-800 text-sm leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            {session.summaryText || "No summary available for this session."}
                        </p>
                    </div>

                    {/* Key Findings */}
                    {session.summary?.shortBullets && session.summary.shortBullets.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle2 size={14} /> Key Findings
                            </h3>
                            <div className="grid gap-2">
                                {session.summary.shortBullets.map((bullet, i) => (
                                    <div key={i} className="flex gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 text-sm text-gray-700">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                                        {bullet} [cite: 67]
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <button 
                        onClick={onClose}
                        className="w-full py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all shadow-lg"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};