import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Briefcase, Wallet, MapPin, ChevronLeft, Ban, Shield, CheckCircle, 
  FileText, Star, CreditCard, Phone, Mail 
} from 'lucide-react';

import { useNotification } from '../../../hooks/useNotification';
import * as techRepo from '../../../../infrastructure/repositories/admin/technicianRepository'; 
import type { TechnicianProfileFull } from '../../../../domain/types/Technician'; 
import ConfirmModal from '../../../components/Admin/Modals/ConfirmModal';

const TABS = [
    { key: 'overview', icon: User, label: 'Overview' },
    { key: 'jobs', icon: Briefcase, label: 'Job History' },
    { key: 'financials', icon: Wallet, label: 'Financials' },
];

const AdminTechnicianProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();

    const [tech, setTech] = useState<TechnicianProfileFull | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(TABS[0].key);
    
    // Modals
    const [suspendModalOpen, setSuspendModalOpen] = useState(false);
    const [isSuspending, setIsSuspending] = useState(false);

    const fetchTech = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await techRepo.getTechnicianProfile(id);
            setTech(data);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to load technician profile";
            showError(message);
        } finally {
            setLoading(false);
        }
    }, [id, showError]); 

    useEffect(() => {
        fetchTech();
    }, [fetchTech]);

    const handleSuspendToggle = async () => {
        if(!tech || !id) return;
        setIsSuspending(true);
        try { 
             const newStatus = !tech.isSuspended;
             await techRepo.toggleBlockTechnician(id, newStatus);
             
             showSuccess(`Technician ${newStatus ? 'Suspended' : 'Activated'}`);
             fetchTech(); 
             setSuspendModalOpen(false);
        } catch(err: unknown) {
            const message = err instanceof Error ? err.message : "Action failed";
            showError(message);
        } finally {
            setIsSuspending(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Profile...</div>;
    if (!tech) return <div className="p-10 text-center text-red-500">Technician Not Found</div>;

    return (
        <div className="flex flex-col h-full w-full bg-gray-50/50">
             {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">
                    <ChevronLeft size={20} /> Back
                </button>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setSuspendModalOpen(true)}
                        className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 border transition-colors ${
                            tech.isSuspended 
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        }`}
                    >
                        {tech.isSuspended ? <Shield size={16}/> : <Ban size={16}/>}
                        {tech.isSuspended ? "Activate Account" : "Suspend Account"}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    
                    {/* Identity Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center gap-6 relative overflow-hidden">
                        <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-white shadow-md overflow-hidden relative z-10 flex-shrink-0">
                             {tech.avatarUrl ? (
                                <img src={tech.avatarUrl} alt={tech.name} className="w-full h-full object-cover"/>
                             ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-2xl font-bold">
                                    {tech.name.charAt(0).toUpperCase()}
                                </div>
                             )}
                        </div>
                        <div className="z-10">
                            <h1 className="text-3xl font-bold text-gray-900">{tech.name}</h1>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="bg-gray-100 px-2 py-1 rounded font-mono border border-gray-200">ID: {tech.id.slice(-6)}</span>
                                <span className={`flex items-center gap-1 font-bold ${tech.isSuspended ? 'text-red-600' : 'text-green-600'}`}>
                                    {tech.isSuspended ? <Ban size={14}/> : <CheckCircle size={14}/>}
                                    {tech.isSuspended ? 'Suspended' : 'Active'}
                                </span>
                                <span className="flex items-center gap-1 text-orange-500 font-bold">
                                    <Star size={14} fill="currentColor"/> {tech.ratings?.averageRating || "New"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[500px]">
                        <div className="border-b border-gray-200 flex px-6 space-x-8">
                             {TABS.map(tab => (
                                 <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`py-4 flex items-center gap-2 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                 >
                                    <tab.icon size={18}/> {tab.label}
                                 </button>
                             ))}
                        </div>

                        <div className="p-6">
                            {activeTab === 'overview' && <OverviewTab tech={tech} />}
                            {activeTab === 'jobs' && <JobsPlaceholder />}
                            {activeTab === 'financials' && <FinancialsPlaceholder tech={tech} />}
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={suspendModalOpen}
                onClose={() => setSuspendModalOpen(false)}
                onConfirm={handleSuspendToggle}
                title={tech.isSuspended ? "Activate Technician" : "Suspend Technician"}
                message={`Are you sure you want to ${tech.isSuspended ? 'activate' : 'suspend'} this account?`}
                confirmText={tech.isSuspended ? "Activate" : "Suspend"}
                variant={tech.isSuspended ? "success" : "danger"}
                isLoading={isSuspending}
            />
        </div>
    );
};
 

interface TabProps {
    tech: TechnicianProfileFull;
}

interface InfoRowProps {
    icon: React.ElementType;
    label: string;
    value?: string;
    mono?: boolean;
}

const OverviewTab: React.FC<TabProps> = ({ tech }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Contact & Personal</h3>
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 space-y-4">
                 <InfoRow icon={Mail} label="Email" value={tech.email} />
                 <InfoRow icon={Phone} label="Phone" value={tech.phone} />
                 {/* Safely access zoneIds[0] */}
                 <InfoRow icon={MapPin} label="Base Zone" value={tech.zoneIds && tech.zoneIds.length > 0 ? tech.zoneIds[0] : "N/A"} />
            </div>
            
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Bank Details</h3>
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 space-y-4">
                 <InfoRow icon={CreditCard} label="Account No" value={tech.bankDetails?.accountNumber} mono />
                 <InfoRow icon={Briefcase} label="Bank Name" value={tech.bankDetails?.bankName} />
                 <InfoRow icon={FileText} label="IFSC Code" value={tech.bankDetails?.ifscCode} mono />
            </div>
        </div>

        <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Service Profile</h3>
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Experience</p>
                <p className="text-gray-900 mb-4">{tech.experienceSummary || "No summary provided"}</p>
                
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                    {tech.categoryIds?.map((c: string) => (
                        <span key={c} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-600">
                            {c}
                        </span>
                    ))}
                    {(!tech.categoryIds || tech.categoryIds.length === 0) && (
                        <span className="text-gray-400 text-sm italic">No categories assigned</span>
                    )}
                </div>
            </div>
        </div>
    </div>
);

const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, value, mono }) => (
    <div className="flex items-center gap-4">
        <div className="p-2 bg-white rounded-lg border border-gray-200 text-gray-500">
            <Icon size={18} />
        </div>
        <div>
            <p className="text-xs font-bold text-gray-400 uppercase">{label}</p>
            <p className={`text-gray-900 font-medium ${mono ? 'font-mono' : ''}`}>{value || "--"}</p>
        </div>
    </div>
);
 

const JobsPlaceholder: React.FC = () => (
    <div className="text-center py-20">
        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Job History Module</h3>
        <p className="text-gray-500 max-w-md mx-auto mt-2">
            This tab will show past and active bookings once the Booking Module is integrated.
        </p>
    </div>
);

const FinancialsPlaceholder: React.FC<TabProps> = ({ tech }) => (
    <div className="space-y-6">
        {/* Wallet Summary Card */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white flex justify-between items-center shadow-lg">
             <div>
                 <p className="text-gray-400 text-sm font-medium">Current Wallet Balance</p>
                 <h2 className="text-3xl font-bold mt-1">₹{tech.walletBalance?.currentBalance || 0}</h2>
             </div>
             <div className="p-3 bg-white/10 rounded-lg backdrop-blur">
                 <Wallet size={32} />
             </div>
        </div>

        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <p className="text-gray-500 font-medium">Transaction History & Payouts Coming Soon...</p>
        </div>
    </div>
);

export default AdminTechnicianProfilePage;