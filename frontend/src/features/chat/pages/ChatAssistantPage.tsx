import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, ChevronLeft, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../layouts/customer/Navbar';
import * as chatRepo from '../api/chatRepository';
import type { ChatMessage, ChatSession } from '../types/ChatTypes';
import MarkdownRenderer from '../components/MarkdownRenderer';

const ChatAssistantPage: React.FC = () => {
    const [session, setSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initChat = async () => {
            try {
                const data = await chatRepo.startChatSession();
                setSession(data);
                setMessages(data.messages);
            } catch (err) {
                console.error("Failed to start chat:", err);
            } finally {
                setInitialLoading(false);
            }
        };
        initChat();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, loading]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !session || loading) return;

        const userMsg = input.trim();
        setInput('');
        setLoading(true);

        const optimisticMsg: ChatMessage = { 
            role: 'user', 
            content: userMsg, 
            timestamp: new Date().toISOString() 
        };
        setMessages(prev => [...prev, optimisticMsg]);

        try {
            const updatedSession = await chatRepo.sendMessage(session.id, userMsg);
            setMessages(updatedSession.messages);
            setSession(updatedSession);
        } catch (err) {
            console.error("Message failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!session) return;
        try {
            await chatRepo.resolveChat(session.id, 'RESOLVED');
            navigate('/profile'); 
        } catch (err) {
            console.error("Resolve failed:", err);
        }
    };

    if (initialLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500 font-medium animate-pulse">Initializing AI Assistant...</p>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#F8FAFC] overflow-hidden">
            <Navbar />
            
            {/* Glassmorphism Header */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-4 md:px-8 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="p-2.5 hover:bg-gray-100 rounded-xl transition-all text-gray-500 hover:text-gray-900"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <div className="relative">
                        <div className="bg-gradient-to-tr from-blue-600 to-blue-400 p-2.5 rounded-2xl shadow-lg shadow-blue-100">
                            <Bot size={26} className="text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <h1 className="font-extrabold text-gray-900 text-lg tracking-tight">ServoFixo AI</h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Expert Diagnostics</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={handleResolve}
                    className="group flex items-center gap-2 text-xs font-bold text-gray-600 bg-gray-100 px-4 py-2.5 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
                >
                    End Session
                </button>
            </div>

            {/* Chat Content with Max Width for Desktop */}
            <div 
                ref={scrollRef} 
                className="flex-1 overflow-y-auto custom-scrollbar px-4 py-8"
            >
                <div className="max-w-4xl mx-auto space-y-8">
                    {messages.map((msg, idx) => (
                        <div 
                            key={idx} 
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                        >
                            <div className={`flex gap-4 max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                                    msg.role === 'user' 
                                        ? 'bg-blue-600' 
                                        : 'bg-white border border-gray-100'
                                }`}>
                                    {msg.role === 'user' ? <User size={18} className="text-white" /> : <Bot size={18} className="text-blue-600" />}
                                </div>
                                <div className={`relative p-5 rounded-3xl shadow-sm text-[15px] leading-relaxed ${
                                    msg.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-tr-none' 
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                }`}>
                                    <MarkdownRenderer content={msg.content} isUser={msg.role === 'user'} />
                                    <span className={`absolute -bottom-5 text-[10px] font-medium text-gray-400 ${msg.role === 'user' ? 'right-2' : 'left-2'}`}>
                                        {new Date(msg.timestamp || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {loading && (
                        <div className="flex items-center gap-4 animate-pulse ml-2">
                             <div className="bg-blue-50 text-blue-600 px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 border border-blue-100 shadow-sm">
                                <Sparkles size={14} className="animate-spin" />
                                Analyzing your request...
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Input Area */}
            <div className="bg-white border-t border-gray-100 p-4 md:p-6 pb-10 md:pb-8">
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSend} className="relative group">
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your issue here (e.g. 'My kitchen tap is leaking')..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-[2rem] pl-6 pr-16 py-4 md:py-5 text-sm md:text-base focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                        />
                        <button 
                            disabled={loading || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-3 md:p-4 rounded-full hover:bg-blue-700 disabled:opacity-30 transition-all shadow-lg shadow-blue-200 active:scale-95"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                    <p className="text-center mt-3 text-[10px] text-gray-400 font-medium">
                        AI can make mistakes. For emergencies, please call professional help immediately.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatAssistantPage;