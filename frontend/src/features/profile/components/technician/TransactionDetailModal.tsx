import React from 'react';
import {  Receipt, Briefcase, Landmark, CheckCircle2, Clock, AlertTriangle  } from 'lucide-react';
import Modal from '../../../../components/Shared/Modal/Modal';
import { useNavigate } from 'react-router-dom';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    transaction: any | null;  
}

const TransactionDetailModal: React.FC<Props> = ({ isOpen, onClose, transaction }) => {
    const navigate = useNavigate();

    if (!transaction) return null;

    const isCredit = transaction.type === 'CREDIT';
    const isEarning = transaction.category === 'JOB_EARNING';
    const isPayout = transaction.category === 'WEEKLY_PAYOUT';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Transaction Details" maxWidth="max-w-md">
            <div className="space-y-6">
                
                {/* 1. AMOUNT HEADER */}
                <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className={`inline-flex p-3 rounded-full mb-3 ${isCredit ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        <Receipt className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{transaction.category.replace(/_/g, ' ')}</p>
                    <h2 className={`text-4xl font-black mt-1 ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isCredit ? '+' : '-'} ₹{Number(transaction.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </h2>
                    
                    <div className="flex items-center justify-center gap-1.5 mt-3">
                        {transaction.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> :
                         transaction.status === 'PENDING' ? <Clock className="w-4 h-4 text-amber-500" /> : 
                         <AlertTriangle className="w-4 h-4 text-red-500" />}
                        <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{transaction.status}</span>
                    </div>
                </div>

                {/* 2. DETAILS LIST */}
                <div className="space-y-4">
                    <DetailRow label="Date & Time" value={new Date(transaction.createdAt).toLocaleString('en-IN')} />
                    
                    {/* Contextual Data: Job Earning */}
                    {isEarning && transaction.bookingId && (
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between mt-4">
                            <div className="flex items-center gap-3 text-blue-800">
                                <Briefcase className="w-5 h-5" />
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider opacity-70">Job Reference</p>
                                    <p className="text-sm font-bold">{transaction.bookingId.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate(`/technician/jobs/${transaction.bookingId}`)}
                                className="p-2 bg-white text-blue-600 rounded-lg shadow-sm hover:bg-blue-600 hover:text-white transition-colors"
                            >
                                View Job
                            </button>
                        </div>
                    )}

                    {/* Contextual Data: Weekly Payout */}
                    {isPayout && (
                        <>
                            {/* ONLY show the Transaction/Reference ID for actual Bank Payouts */}
                            <DetailRow 
                                label="Bank Ref Number" 
                                value={transaction.referenceId || "Processing..."} // This would be your Razorpay ID
                                isMono 
                            />
                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center gap-3 mt-4 text-purple-800">
                                <Landmark className="w-5 h-5 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider opacity-70">Sent to Bank Account</p>
                                    <p className="text-sm font-bold">Processed by Admin</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};

// Helper for UI rows
const DetailRow = ({ label, value, isMono = false }: { label: string, value: string, isMono?: boolean }) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
        <span className="text-xs font-bold text-slate-400">{label}</span>
        <span className={`text-sm font-bold text-slate-900 ${isMono ? 'font-mono' : ''}`}>{value}</span>
    </div>
);

export default TransactionDetailModal;