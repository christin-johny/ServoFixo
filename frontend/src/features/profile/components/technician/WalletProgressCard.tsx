import React from 'react';
import { Wallet, IndianRupee, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';
import type { WalletDetailsDto } from '../../types/TechnicianTypes';

interface Props {
    data: WalletDetailsDto;
    onManageClick: () => void;
}

const WalletProgressCard: React.FC<Props> = ({ data, onManageClick }) => {
    // FALLBACK CALCULATIONS: If backend doesn't send 'insights', calculate them here
    const THRESHOLD = 500;
    const withdrawable = data?.balances?.withdrawable || 0;
    
    // Use backend insights if available, otherwise calculate locally
    const isEligible = data?.insights?.isEligible ?? (withdrawable >= THRESHOLD);
    const progress = data?.insights?.payoutProgressPercentage ?? Math.min((withdrawable / THRESHOLD) * 100, 100);
    const gap = data?.insights?.thresholdGap ?? Math.max(THRESHOLD - withdrawable, 0);

    return (
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:border-blue-100 transition-all group">
            <div className="flex justify-between items-start mb-8">
                <div className="p-4 bg-blue-50 rounded-2xl group-hover:scale-110 transition-transform">
                    <Wallet className="w-6 h-6 text-blue-600" />
                </div>
                <button 
                    onClick={onManageClick}
                    className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/50 px-4 py-2 rounded-xl transition-colors"
                >
                    Earnings Ledger <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-1 mb-8">
                <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    Withdrawable Balance 
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" title="Verified Earnings" />
                </p>
                <div className="flex items-baseline gap-1">
                    <IndianRupee className="w-6 h-6 text-slate-900" />
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                        {withdrawable.toLocaleString('en-IN')}
                    </h2>
                </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-50">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Weekly Payout Threshold (₹500)</span>
                    <span className={isEligible ? "text-emerald-600" : ""}>
                        {Math.round(progress)}%
                    </span>
                </div>
                
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-1000 ease-out rounded-full ${
                            isEligible ? "bg-emerald-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <p className="text-xs text-slate-600 font-bold">
                        {isEligible 
                            ? "Auto-payout scheduled for next cycle" 
                            : `Earn ₹${gap.toFixed(2)} more to qualify for payout`}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WalletProgressCard;