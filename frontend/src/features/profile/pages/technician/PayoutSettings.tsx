import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    Landmark, CreditCard, User, Hash,
    ArrowLeft, AlertTriangle, Clock, PenTool,
    Wallet, IndianRupee, History
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../../../store/store";

import { dismissRequestAlert } from "../../../../store/technicianSlice";
import { dismissRequestNotification } from "../../api/technicianProfileRepository";
import { AlertCard } from "../../../../components/Shared/AlertCard/AlertCard";
 
import BankUpdateModal from "../../components/technician/BankUpdateModal";

const PayoutSettings: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { profile } = useSelector((state: RootState) => state.technician);

    //   Modal State
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);

    if (!profile) return null;


    const rejectedBankRequests = profile.bankUpdateRequests?.filter(
        r => r.status === "REJECTED" && !r.isDismissed
    ) || [];

    const handleDismiss = async (requestId: string) => {
        try {
            // Optimistic UI update via Redux
            dispatch(dismissRequestAlert(requestId));
            // Backend update via Repository
            await dismissRequestNotification(requestId);
        } catch (error) {
            console.error("Failed to dismiss alert:", error);
        }
    };

    //   Logic for Status and Wallet
    const pendingBankRequest = profile.bankUpdateRequests?.find(r => r.status === "PENDING");
    const isPayoutOnHold = profile.payoutStatus === "ON_HOLD";
    const frozenAmount = profile.walletBalance?.frozenAmount || 0;
    const currentBalance = profile.walletBalance?.currentBalance || 0;

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
                {/*   BANK REJECTIONS */}
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

                {/*   PENDING OR GLOBAL HOLD (Only if no active rejection is shown) */}
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
            {/* --- 4. CONTENT GRID --- */}
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
                                {currentBalance.toLocaleString('en-IN')}
                            </div>

                            {/*   Logic: Show "Processing" money if frozenAmount > 0 */}
                            {frozenAmount > 0 && (
                                <div className="mt-4 flex flex-col items-center">
                                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">Processing</span>
                                    <span className="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100 animate-pulse">
                                        ₹{frozenAmount.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button className="w-full mt-auto py-2.5 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center justify-center gap-2">
                            <History className="w-4 h-4" />
                            Transaction History
                        </button>
                    </div>
                </div>

                {/* RIGHT: BANK DETAILS (Col-8) */}
                <div className="md:col-span-8 space-y-6 order-1 md:order-2">
                    
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 min-h-[300px]">
                        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <Landmark className="w-3.5 h-3.5 text-gray-400" /> Payout Method
                            </h3>

                            {/*   ACTION LOCK: Disable button if a request is already pending */}
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

            {/*   MODAL FOR UPDATES */}
            <BankUpdateModal
                isOpen={isBankModalOpen}
                onClose={() => setIsBankModalOpen(false)}
            />

        </div>
    );
};

export default PayoutSettings;