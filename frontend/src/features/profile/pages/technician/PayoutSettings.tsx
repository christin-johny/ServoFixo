import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    Landmark, CreditCard, User, Hash,
    ArrowLeft, AlertTriangle, Clock, PenTool,
    Wallet, IndianRupee, History, Loader2,Briefcase
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../../../store/store";

import { dismissRequestAlert, setWalletData } from "../../../../store/technicianSlice";
import { dismissRequestNotification } from "../../api/technicianProfileRepository";
import { AlertCard } from "../../../../components/Shared/AlertCard/AlertCard";
import { getWalletTransactions, getWalletDetails } from "../../api/technicianWalletRepository";
import type { TransactionDto } from "../../types/TechnicianTypes";
 
import BankUpdateModal from "../../components/technician/BankUpdateModal";
import TransactionDetailModal from "../../components/technician/TransactionDetailModal";

const PayoutSettings: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // We grab BOTH profile and the new wallet state from Redux
    const { profile, wallet } = useSelector((state: RootState) => state.technician);

    // Modal & Loading State
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [transactions, setTransactions] = useState<TransactionDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTx, setSelectedTx] = useState<TransactionDto | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
 
const [activeTab, setActiveTab] = useState<'EARNINGS' | 'PAYOUTS'>('EARNINGS');
 
    useEffect(() => {
        const loadPayoutData = async () => {
            setLoading(true); 
            try {
                const [txRes, walletRes] = await Promise.all([
                    getWalletTransactions(page), 
                    getWalletDetails()
                ]);

                let txList: TransactionDto[] = [];
                let totalItems = 0;
                const limit = 10; 

                // FIX: TypeScript now knows this is txRes.data
                if (txRes && txRes.data && Array.isArray(txRes.data)) {
                    txList = txRes.data;
                    totalItems = txRes.total || 0;
                }
                
                setTransactions(txList);
                setTotalPages(Math.ceil(totalItems / limit) || 1);

                if (walletRes) {
                    dispatch(setWalletData(walletRes));
                }

            } catch (err) {
                console.error("Failed to load payout data", err);
            } finally {
                setLoading(false);
            }
        };
        
        loadPayoutData();
    }, [dispatch, page]);
    

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }
    
    const rejectedBankRequests = profile.bankUpdateRequests?.filter(
        r => r.status === "REJECTED" && !r.isDismissed
    ) || [];

    const handleDismiss = async (requestId: string) => {
        try {
            dispatch(dismissRequestAlert(requestId));
            await dismissRequestNotification(requestId);
        } catch (error) {
            console.error("Failed to dismiss alert:", error);
        }
    };

    // --- FINANCIAL LOGIC ---
    const pendingBankRequest = profile.bankUpdateRequests?.find(r => r.status === "PENDING");
    const isPayoutOnHold = profile.payoutStatus === "ON_HOLD";
    
    // Read directly from the NEW wallet state we just fetched
    const currentBalance = wallet?.balances?.withdrawable || 0;
    const frozenAmount = wallet?.balances?.pending || 0;

    return (
        <div className="w-full space-y-6 animate-fade-in pb-12">

            {/* --- 1. NAVIGATION --- */}
            <div>
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors px-1"
                >
                    <div className="p-1 rounded-full bg-white border border-gray-200 group-hover:border-gray-300 shadow-sm transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Back to Profile
                </button>
            </div>

            {/* --- 2. HEADER --- */}
            <div className="flex flex-col gap-1 px-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Payout Settings
                </h1>
                <p className="text-sm text-gray-500">
                    Manage your bank account and view earnings status.
                </p>
            </div>

            {/* --- 3. UNIFIED STATUS & NOTIFICATION CENTER --- */}
            <div className="space-y-3">
                {rejectedBankRequests.map(req => (
                    <AlertCard
                        key={req.id}
                        title="Bank Account Rejected"
                        detail={`${req.bankName} (${req.accountNumber.slice(-4)})`}
                        reason={req.adminComments || "Verification failed."}
                        onDismiss={() => handleDismiss(req.id)}
                        onFix={() => {
                            handleDismiss(req.id);
                            setIsBankModalOpen(true);
                        }}
                    />
                ))}

                {pendingBankRequest ? (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center gap-3">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <p className="text-xs text-gray-600 font-medium">Bank update under review. Payouts paused.</p>
                    </div>
                ) : (isPayoutOnHold && rejectedBankRequests.length === 0) && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <p className="text-xs text-gray-600 font-medium">Payouts are currently paused. Contact support.</p>
                    </div>
                )}
            </div>

            {/* --- 4. TOP CONTENT GRID (Bank & Balance) --- */}
            <div className="grid md:grid-cols-12 gap-6">

                {/* LEFT: WALLET SUMMARY (Col-4) */}
                <div className="md:col-span-4 space-y-6 order-2 md:order-1">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Wallet className="w-3.5 h-3.5 text-gray-400" /> Wallet Balance
                            </h3>
                        </div>

                        <div className="flex-grow flex flex-col justify-center items-center text-center py-6">
                            <span className="text-sm text-gray-500 font-medium mb-1">Available for Payout</span>
                            <div className="text-3xl font-bold text-gray-900 flex items-center">
                                <IndianRupee className="w-6 h-6 text-gray-400" />
                                {currentBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </div>

                            {/* Processing Logic */}
                            {frozenAmount > 0 && (
                                <div className="mt-4 flex flex-col items-center">
                                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">Processing</span>
                                    <span className="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 animate-pulse">
                                        ₹{frozenAmount.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: BANK DETAILS (Col-8) */}
                <div className="md:col-span-8 space-y-6 order-1 md:order-2">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 min-h-[300px]">
                        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Landmark className="w-3.5 h-3.5 text-gray-400" /> Payout Method
                            </h3>

                            <button
                                onClick={() => setIsBankModalOpen(true)}
                                disabled={!!pendingBankRequest}
                                className={`
                                    flex items-center gap-1.5 
                                    px-3 py-1.5 text-xs font-bold 
                                    rounded-lg transition-all
                                    ${pendingBankRequest
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                        : "text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-200 active:scale-95 shadow-sm"
                                    }
                                `}
                            >
                                {pendingBankRequest ? (
                                    <>
                                        <Clock className="w-3.5 h-3.5" />
                                        Pending Approval
                                    </>
                                ) : (
                                    <>
                                        <PenTool className="w-3.5 h-3.5" />
                                        Edit Details
                                    </>
                                )}
                            </button>
                        </div>

                        {profile.bankDetails ? (
                            <div className="grid gap-6">
                                {/* Beneficiary */}
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                    <div className="p-2.5 bg-white rounded-lg shadow-sm text-blue-600">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Account Holder</p>
                                        <p className="text-base font-bold text-gray-900 mt-0.5">{profile.bankDetails.accountHolderName}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <Landmark className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Bank</p>
                                            <p className="text-sm font-bold text-gray-900">{profile.bankDetails.bankName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100">
                                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                            <Hash className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">IFSC</p>
                                            <p className="text-sm font-bold text-gray-900 font-mono uppercase">{profile.bankDetails.ifscCode}</p>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2 flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Account Number</p>
                                            <p className="text-sm font-bold text-gray-900 font-mono tracking-[0.2em]">
                                                •••• •••• {profile.bankDetails.accountNumber.slice(-4)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <Landmark className="w-10 h-10 text-gray-300 mb-3" />
                                <h3 className="text-base font-bold text-gray-900">Setup Payouts</h3>
                                <p className="text-xs text-gray-500 max-w-xs mt-1 mb-4">
                                    Link your bank account to receive payments for completed jobs.
                                </p>
                                <button
                                    onClick={() => setIsBankModalOpen(true)}
                                    className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95"
                                >
                                    Link Bank Account
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
 
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-200 shadow-sm mt-6 w-full">
                
                {/* Header & Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <History className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900">Financial History</h3>
                    </div>

                    {/* The Toggle Tabs */}
                    <div className="flex p-1 bg-slate-100 rounded-xl">
                        <button
                            onClick={() => setActiveTab('EARNINGS')}
                            className={`flex-1 sm:flex-none px-6 py-2 text-xs font-bold rounded-lg transition-all ${
                                activeTab === 'EARNINGS' 
                                ? 'bg-white text-slate-900 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Job Earnings
                        </button>
                        <button
                            onClick={() => setActiveTab('PAYOUTS')}
                            className={`flex-1 sm:flex-none px-6 py-2 text-xs font-bold rounded-lg transition-all ${
                                activeTab === 'PAYOUTS' 
                                ? 'bg-white text-slate-900 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            Bank Payouts
                        </button>
                    </div>
                </div>

                {/* The List Data */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="py-12 flex justify-center items-center">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        (() => {
                            // Filter data based on the active tab
                            const displayData = transactions.filter(tx => 
                                activeTab === 'EARNINGS' ? tx.type === 'CREDIT' : tx.type === 'DEBIT'
                            );

                            if (displayData.length === 0) {
                                return (
                                    <div className="py-16 text-center text-slate-400 flex flex-col items-center">
                                        <History className="w-12 h-12 mb-3 opacity-20" />
                                        <p className="text-sm font-medium">No {activeTab.toLowerCase()} recorded yet.</p>
                                        <p className="text-xs mt-1">
                                            {activeTab === 'EARNINGS' 
                                                ? "When you complete a job, your earnings will appear here."
                                                : "When money is sent to your bank, it will appear here."}
                                        </p>
                                    </div>
                                );
                            }

                            return displayData.map((tx) => (
                                <div 
                                    key={tx.id} 
                                    onClick={() => setSelectedTx(tx)} // Triggers your modal
                                    className="flex items-center justify-between p-4 md:p-5 bg-slate-50 rounded-2xl border border-slate-100/50 hover:bg-white hover:border-blue-100 hover:shadow-md transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl hidden sm:block ${
                                            tx.type === 'CREDIT' ? 'bg-emerald-100/50 text-emerald-600' : 'bg-slate-200/50 text-slate-700'
                                        }`}>
                                            {tx.type === 'CREDIT' ? <Briefcase className="w-4 h-4" /> : <Landmark className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">
                                                {tx.type === 'CREDIT' ? 'Service Completed' : 'Transferred to Bank'}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col justify-center">
                                        <p className={`text-base sm:text-lg font-black ${
                                            tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-900'
                                        }`}>
                                            {tx.type === 'CREDIT' ? '+' : '-'} ₹{Number(tx.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                        </p>
                                        <div className="flex items-center justify-end gap-1.5 mt-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                                tx.status === 'COMPLETED' ? 'bg-emerald-500' : tx.status === 'FAILED' ? 'bg-red-500' : 'bg-amber-500'
                                            }`} />
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{tx.status}</p>
                                        </div>
                                    </div>
                                </div>
                            ));
                        })()
                    )}
                </div>
                {/* --- PAGINATION CONTROLS --- */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
                        <button 
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                                page === 1 
                                ? 'bg-slate-50 text-slate-300 cursor-not-allowed' 
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95'
                            }`}
                        >
                            Previous
                        </button>
                        
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Page {page} of {totalPages}
                        </span>
                        
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                                page === totalPages 
                                ? 'bg-slate-50 text-slate-300 cursor-not-allowed' 
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95'
                            }`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* MODAL FOR UPDATES */}
            <BankUpdateModal
                isOpen={isBankModalOpen}
                onClose={() => setIsBankModalOpen(false)}
            />

            <BankUpdateModal
                isOpen={isBankModalOpen}
                onClose={() => setIsBankModalOpen(false)}
            />

            {/* ADD THIS */}
            <TransactionDetailModal 
                isOpen={!!selectedTx} 
                onClose={() => setSelectedTx(null)} 
                transaction={selectedTx} 
            />

        </div>
    );
};

export default PayoutSettings;