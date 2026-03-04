import React, { useState, useEffect, useCallback } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Briefcase, Wallet, ChevronLeft, Ban, Shield, CheckCircle, 
  Star, Edit2, FileText, AlertCircle,ArrowDownRight, ArrowUpRight,  MapPin, ReceiptText 
} from 'lucide-react';

import { useNotification } from '../../../../notifications/hooks/useNotification';
import * as techRepo from '../../../api/adminTechnicianRepository'; 
import type { TechnicianProfileFull } from '../../../types/Technician'; 
import type { UpdateTechnicianPayload } from '../../../api/adminTechnicianRepository';

import ConfirmModal from '../../../../../components/Shared/ConfirmModal/ConfirmModal';
import TechnicianEditModal from '../../../components/admin/TechnicianEditModal';
import TechnicianProfileSummary from '../../../components/admin/TechnicianProfileSummary';
import { FileLightbox } from '../../../../../components/Shared/FileLightbox/FileLightbox';
 
import { getTechnicianJobsAdmin, getTechnicianTransactionsAdmin } from '../../../api/adminTechnicianRepository';
import type { AdminBookingListDto } from '../../../../booking/api/adminBookingRepository';
import type { TransactionDto } from '../../../types/TechnicianTypes';


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
            setTech(prev => prev ? { ...prev, ...data } : null); 
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
                            
                            {activeTab === 'jobs' && <JobsTab techId={tech.id} />}
                            {activeTab === 'financials' && <FinancialsTab tech={tech} />}
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
 
const JobsTab: React.FC<{ techId: string }> = ({ techId }) => {
    const navigate = useNavigate(); // ADDED: Initialize the navigate hook
    
    const [jobs, setJobs] = useState<AdminBookingListDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const result = await getTechnicianJobsAdmin(techId, page);
                setJobs(result.data);
                setTotalPages(result.totalPages);
            } catch   {
                console.error("Failed to load jobs");
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [techId, page]);

    if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse">Loading Job History...</div>;

    if (jobs.length === 0) return (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            <Briefcase size={32} className="mx-auto text-gray-400 mb-3" />
            <h4 className="text-gray-900 font-bold mb-1">No Jobs Found</h4>
            <p className="text-gray-500 font-medium text-sm">This technician has not completed any jobs yet.</p>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                {jobs.map(job => (
                    <div 
                        key={job.id} 
                        onClick={() => navigate(`/admin/bookings/${job.id}`)} // ADDED: The redirect logic
                        className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group" // ADDED: cursor-pointer and hover effects
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2.5 py-1 rounded-[6px] text-[10px] font-black uppercase tracking-wider ${
                                    job.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                                    job.status === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                                    'bg-blue-50 text-blue-700'
                                }`}>
                                    {job.status.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-gray-400 font-mono">ID: {job.id.slice(-6)}</span>
                            </div>
                            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{job.snapshots.service.name}</h4>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 font-medium">
                                <span className="flex items-center gap-1"><User size={14}/> {job.snapshots.customer.name}</span>
                                <span className="flex items-center gap-1"><MapPin size={14}/> {job.location.address.split(',')[0]}</span>
                            </div>
                        </div>
                        <div className="text-left sm:text-right flex items-center justify-between sm:block w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                            <div>
                                <p className="text-lg font-black text-gray-900">₹{job.pricing.final || job.pricing.estimated}</p>
                                <p className="text-xs text-gray-400 mt-1">{new Date(job.timestamps.createdAt).toLocaleDateString()}</p>
                            </div>
                            {/* ADDED: A small arrow to visually indicate it's clickable */}
                            <div className="sm:hidden bg-gray-50 p-2 rounded-lg group-hover:bg-blue-50 text-gray-400 group-hover:text-blue-600">
                                <ArrowUpRight size={16} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-50 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors">Previous</button>
                    <span className="text-sm font-medium text-gray-500">Page {page} of {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-50 rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors">Next</button>
                </div>
            )}
        </div>
    );
};

const FinancialsTab: React.FC<{ tech: TechnicianProfileFull }> = ({ tech }) => {
    const [transactions, setTransactions] = useState<TransactionDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchLedger = async () => {
            setLoading(true);
            try {
                const result = await getTechnicianTransactionsAdmin(tech.id, page);
                setTransactions(result.transactions || []);
                setTotalPages(Math.ceil((result.total || 0) / 10)); 
            } catch  {
                console.error("Failed to load transactions");
            } finally {
                setLoading(false);
            }
        };
        fetchLedger();
    }, [tech.id, page]);

    return (
        <div className="space-y-8">
            {/* Wallet Balances Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                     <div className="absolute right-0 top-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                     <p className="text-gray-500 text-xs font-bold uppercase tracking-wider relative z-10">Withdrawable Balance</p>
                     <h2 className="text-4xl font-black text-gray-900 mt-2 relative z-10">₹{tech.walletBalance?.currentBalance || 0}</h2>
                     <p className="text-xs text-gray-400 mt-2 relative z-10">Available for next payout batch</p>
                 </div>
                 <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                     <div className="absolute right-0 top-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                     <p className="text-gray-500 text-xs font-bold uppercase tracking-wider relative z-10">Pending / Frozen</p>
                     <h2 className="text-4xl font-black text-gray-900 mt-2 relative z-10">₹{tech.walletBalance?.frozenAmount || 0}</h2>
                     <p className="text-xs text-gray-400 mt-2 relative z-10">Currently locked in processing</p>
                 </div>
            </div>

            {/* Transactions Ledger */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><ReceiptText size={18} className="text-blue-600"/> Transaction Ledger</h3>
                </div>
                
                {loading ? (
                    <div className="p-10 text-center text-gray-500 animate-pulse">Loading Ledger...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50/50">
                        <Wallet size={32} className="mx-auto text-gray-400 mb-3" />
                        <h4 className="text-gray-900 font-bold">No Transactions</h4>
                        <p className="text-gray-500 text-sm mt-1">This wallet has no history.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs text-gray-500 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Transaction</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {transactions.map(txn => {
                                    const isCredit = txn.type === 'CREDIT';
                                    return (
                                        <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${isCredit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                        {isCredit ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{txn.description}</p>
                                                        <p className="text-[10px] font-mono text-gray-400 mt-0.5">ID: {txn.id.slice(-8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold tracking-wider">{txn.category.replace(/_/g, ' ')}</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-medium">
                                                {new Date(txn.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right font-black">
                                                <span className={isCredit ? 'text-green-600' : 'text-gray-900'}>
                                                    {isCredit ? '+' : '-'} ₹{txn.amount.toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {/* Pagination Controls */}
                {totalPages > 1 && !loading && (
                    <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50/50">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors">Previous</button>
                        <span className="text-sm font-medium text-gray-500">Page {page} of {totalPages}</span>
                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors">Next</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTechnicianProfilePage;