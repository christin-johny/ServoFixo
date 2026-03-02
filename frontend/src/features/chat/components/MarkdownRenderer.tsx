import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BellRing, ShieldAlert, CheckCircle, Calendar, LayoutGrid } from 'lucide-react';

interface Props {
    content: string;
    isUser: boolean;
}

const MarkdownRenderer: React.FC<Props> = ({ content, isUser }) => {
    const navigate = useNavigate();
    const [isRequested, setIsRequested] = useState(false);

    // Regex patterns for all discussed contexts
    const EMERGENCY_REGEX = /\[ACTION:EMERGENCY\]/;
    const REDIRECT_REGEX = /\[REDIRECT:([a-zA-Z0-9_]+)\]/;
    const NO_SERVICE_REGEX = /\[ACTION:NO_SERVICE:(.+)\]/;

    const renderContent = () => {
        const isEmergency = EMERGENCY_REGEX.test(content);
        const redirectMatch = content.match(REDIRECT_REGEX);
        const noServiceMatch = content.match(NO_SERVICE_REGEX);

        const cleanContent = content
            .replace(EMERGENCY_REGEX, "")
            .replace(REDIRECT_REGEX, "")
            .replace(NO_SERVICE_REGEX, "");

        return (
            <div className="flex flex-col gap-4">
                <div className={`prose prose-sm max-w-none ${isUser ? 'text-white' : 'text-gray-800'}`}>
                    <ReactMarkdown components={{
                        p: ({ children }) => <p className="mb-2 leading-relaxed last:mb-0">{children}</p>,
                        strong: ({ children }) => <span className={`font-bold ${isUser ? 'text-white' : 'text-blue-700'}`}>{children}</span>,
                    }}>
                        {cleanContent}
                    </ReactMarkdown>
                </div>

                {/* 1. EMERGENCY UI */}
                {isEmergency && (
                    <div className="mt-2 p-4 bg-red-50 border-2 border-red-500 rounded-2xl flex items-start gap-3 animate-pulse">
                        <ShieldAlert className="text-red-500 shrink-0" size={20} />
                        <p className="text-red-900 text-sm font-bold">Safety Alert: Follow the emergency instructions above immediately.</p>
                    </div>
                )}

                {/* 2. DYNAMIC ROUTING (The contexts we discussed) */}
                {!isEmergency && redirectMatch && (() => {
                    const target = redirectMatch[1];
                    
                    // Specific Context: My Bookings
                    if (target === 'MY_BOOKINGS') {
                        return (
                            <button onClick={() => navigate('/booking/history')} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                                <Calendar size={18} /> View My Appointments
                            </button>
                        );
                    }
                    
                    // Specific Context: View All Categories
                    if (target === 'CATEGORIES') {
                        return (
                            <button onClick={() => navigate('/services')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                                <LayoutGrid size={18} /> Explore All Services
                            </button>
                        );
                    }

                    // Default: Direct Category Booking
                    return (
                        <button onClick={() => navigate(`/services?categoryId=${target}`)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all">
                            Book Professional Service <ArrowRight size={18} />
                        </button>
                    );
                })()}

                {/* 3. NO SERVICE / FEEDBACK LOOP */}
                {!isEmergency && !redirectMatch && noServiceMatch && (
                    <div className="mt-2 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                        <div className="flex items-start gap-3">
                            <BellRing className="text-gray-400 shrink-0" size={18} />
                            <div className="flex-1">
                                <p className="text-xs font-bold text-gray-700">Expanding Soon</p>
                                <p className="text-[11px] text-gray-500">We don't offer <strong>{noServiceMatch[1]}</strong> yet.</p>
                                <button 
                                    onClick={() => setIsRequested(true)}
                                    className={`mt-3 text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-2 ${
                                        isRequested ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-300 text-blue-600'
                                    }`}
                                >
                                    {isRequested ? <><CheckCircle size={12} /> Interest Logged</> : `Notify me when ${noServiceMatch[1]} launches`}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return <div className="max-w-none">{renderContent()}</div>;
};

export default MarkdownRenderer;