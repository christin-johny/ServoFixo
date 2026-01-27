import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Briefcase, Wallet, ChevronLeft, Ban, Shield, CheckCircle, 
  Star, Edit2, FileText, AlertCircle
} from 'lucide-react';

import { useNotification } from '../../../hooks/useNotification';
import * as techRepo from '../../../../infrastructure/repositories/admin/technicianRepository'; 
import type { TechnicianProfileFull } from '../../../../domain/types/Technician'; 
import type { UpdateTechnicianPayload } from '../../../../infrastructure/repositories/admin/technicianRepository';

import ConfirmModal from '../../../components/Shared/ConfirmModal/ConfirmModal';
import TechnicianEditModal from '../../../components/Admin/technician/TechnicianEditModal';
import TechnicianProfileSummary from '../../../components/Admin/technician/TechnicianProfileSummary';

//   IMPORT SHARED COMPONENT
import { FileLightbox } from '../../../components/Shared/FileLightbox/FileLightbox';

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
    const [editModalOpen, setEditModalOpen] = useState(false);

    // Lightbox State
    const [previewDoc, setPreviewDoc] = useState<{ url: string, type: string } | null>(null);

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
             setTech(prev => prev ? ({ ...prev, isSuspended: newStatus }) : null);
             showSuccess(`Technician ${newStatus ? 'Suspended' : 'Activated'}`);
             setSuspendModalOpen(false);
        } catch(err: unknown) {
            const message = err instanceof Error ? err.message : "Action failed";
            showError(message);
        } finally {
            setIsSuspending(false);
        }
    };

    const handleEditSave = async (id: string, data: UpdateTechnicianPayload) => {
        try {
            await techRepo.updateTechnician(id, data);
            showSuccess("Profile Updated Successfully");
            fetchTech(); 
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to update";
            showError(msg);
            throw err;
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full text-gray-500 gap-2">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Loading Profile...
        </div>
    );
    
    if (!tech) return <div className="p-10 text-center text-red-500 font-bold">Technician Not Found</div>;

    return (
        <div className="flex flex-col h-full w-full bg-gray-50/50">
             
            {/* HEADER */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        {/* Back Button */}
                        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors self-start sm:self-auto group">
                            <div className="p-1 rounded-full group-hover:bg-gray-100 transition-colors">
                                <ChevronLeft size={20} />
                            </div>
                            <span className="text-sm">Back to List</span>
                        </button>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                            <button 
                                onClick={() => setEditModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all w-full sm:w-auto shadow-sm"
                            >
                                <Edit2 size={16}/> Edit Profile
                            </button>

                            <button 
                                onClick={() => setSuspendModalOpen(true)}
                                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border transition-all w-full sm:w-auto shadow-sm ${
                                    tech.isSuspended 
                                    ? 'bg-green-600 text-white border-green-600 hover:bg-green-700 hover:shadow-green-100' 
                                    : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300'
                                }`}
                            >
                                {tech.isSuspended ? <Shield size={16}/> : <Ban size={16}/>}
                                {tech.isSuspended ? "Activate Account" : "Suspend Account"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6">
                    
                    {/* IDENTITY CARD */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 relative overflow-hidden">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6 relative z-10">
                            
                            {/* Avatar */}
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gray-50 border-4 border-white shadow-md overflow-hidden shrink-0">
                                 {tech.avatarUrl ? (
                                    <img src={tech.avatarUrl} alt={tech.name} className="w-full h-full object-cover"/>
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 text-3xl font-bold">
                                        {tech.name.charAt(0).toUpperCase()}
                                    </div>
                                 )}
                            </div>
                            
                            {/* Details */}
                            <div className="text-center md:text-left flex-1 min-w-0 w-full">
                                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 truncate px-2 md:px-0">{tech.name}</h1>
                                
                                <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 sm:gap-3 mt-3 sm:mt-4 text-sm text-gray-500">
                                    <span className="bg-gray-100 px-3 py-1 rounded-lg font-mono border border-gray-200 text-xs font-medium tracking-wide">
                                        ID: {tech.id.slice(-6)}
                                    </span>
                                    
                                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs border ${
                                        tech.isSuspended 
                                        ? 'bg-red-50 text-red-700 border-red-100' 
                                        : 'bg-green-50 text-green-700 border-green-100'
                                    }`}>
                                        {tech.isSuspended ? <Ban size={12}/> : <CheckCircle size={12}/>}
                                        {tech.isSuspended ? 'Suspended' : 'Active'}
                                    </span>

                                    <span className="flex items-center gap-1 text-amber-500 font-bold px-2 py-1 bg-amber-50 rounded-lg border border-amber-100">
                                        <Star size={14} fill="currentColor"/> {tech.ratings?.averageRating || "New"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* TABS & CONTENT */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[400px] sm:min-h-[500px] flex flex-col">
                        
                        <div className="border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
                            <div className="flex px-4 sm:px-6 space-x-6 sm:space-x-8 overflow-x-auto scrollbar-hide">
                                 {TABS.map(tab => (
                                     <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`py-3 sm:py-4 flex items-center gap-2 text-sm font-bold border-b-2 transition-all whitespace-nowrap shrink-0 ${
                                            activeTab === tab.key 
                                            ? 'border-blue-600 text-blue-600' 
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                     >
                                        <tab.icon size={18} className={activeTab === tab.key ? "text-blue-600" : "text-gray-400"}/> 
                                        {tab.label}
                                     </button>
                                 ))}
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 lg:p-8 flex-1">
                            {activeTab === 'overview' && (
                                <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
                                    <TechnicianProfileSummary profile={tech} />
                                    
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Verification Documents</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            {tech.documents.map((doc, idx) => {
                                                const isApproved = doc.status === 'APPROVED';
                                                const isRejected = doc.status === 'REJECTED';
                                                
                                                return (
                                                    <div key={idx} className="flex items-center bg-white border border-gray-200 rounded-xl p-3 gap-3 sm:gap-4 hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setPreviewDoc({ url: doc.fileUrl, type: doc.type })}>
                                                        <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center shrink-0 relative overflow-hidden">
                                                            {doc.fileUrl.toLowerCase().includes('pdf') ? (
                                                                <FileText className="text-gray-400" size={24} />
                                                            ) : (
                                                                <img src={doc.fileUrl} alt={doc.type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <h4 className="font-bold text-gray-900 text-xs uppercase truncate pr-2">{doc.type.replace(/_/g, ' ')}</h4>
                                                                <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold border shrink-0 ${
                                                                    isApproved ? 'bg-green-50 text-green-700 border-green-200' : 
                                                                    isRejected ? 'bg-red-50 text-red-700 border-red-200' : 
                                                                    'bg-blue-50 text-blue-700 border-blue-200'
                                                                }`}>
                                                                    {doc.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 truncate">{doc.fileName}</p>
                                                            
                                                            {isRejected && doc.rejectionReason && (
                                                                <div className="mt-2 flex items-start gap-1.5 text-[11px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                                                                    <AlertCircle size={12} className="shrink-0 mt-0.5" />
                                                                    <span className="leading-tight break-words">{doc.rejectionReason}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                            
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

            <TechnicianEditModal 
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                technician={tech}
                onSave={handleEditSave}
            />

            {/*   REUSED SHARED COMPONENT */}
            {previewDoc && (
                <FileLightbox
                    url={previewDoc.url}
                    type={previewDoc.type}
                    title={previewDoc.type.replace(/_/g, " ")}
                    onClose={() => setPreviewDoc(null)}
                />
            )}
        </div>
    );
};

const JobsPlaceholder: React.FC = () => (
    <div className="text-center py-12 sm:py-24 px-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Briefcase size={28} className="sm:w-8 sm:h-8" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Job History Module</h3>
        <p className="text-gray-500 max-w-md mx-auto mt-2 sm:mt-3 text-sm leading-relaxed">
            This tab will show past and active bookings once the Booking Module is integrated. You'll see earnings, customer ratings, and job details here.
        </p>
    </div>
);

const FinancialsPlaceholder: React.FC<{ tech: TechnicianProfileFull }> = ({ tech }) => (
    <div className="space-y-6 sm:space-y-8">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 md:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-xl gap-4 sm:gap-6">
             <div>
                 <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Current Wallet Balance</p>
                 <h2 className="text-3xl sm:text-4xl font-extrabold mt-2 tracking-tight">₹{tech.walletBalance?.currentBalance || 0}</h2>
                 <p className="text-xs text-gray-500 mt-2">Available for payout</p>
             </div>
             <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm self-end sm:self-auto border border-white/10">
                 <Wallet size={32} />
             </div>
        </div>

        <div className="text-center py-12 sm:py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 px-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 shadow-sm">
                <Wallet size={24} className="text-gray-400"/>
            </div>
            <h4 className="text-gray-900 font-bold mb-1">No Transactions Yet</h4>
            <p className="text-gray-500 font-medium text-sm">Transaction History & Payouts Coming Soon...</p>
        </div>
    </div>
);

export default AdminTechnicianProfilePage;