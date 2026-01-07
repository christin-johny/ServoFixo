import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft, CheckCircle, XCircle, User, CreditCard, FileText, Shield, 
    AlertTriangle, ExternalLink, Calendar, Layers, Eye, Check,Briefcase
} from "lucide-react";
import { format } from "date-fns";

import { useNotification } from "../../../hooks/useNotification";
import * as techRepo from "../../../../infrastructure/repositories/admin/technicianRepository";
import type { TechnicianProfileFull } from "../../../../domain/types/Technician"; 
import ConfirmModal from "../../../components/Admin/Modals/ConfirmModal";
 
type DocDecision = {
    status: "APPROVED" | "REJECTED";
    reason?: string;
};

interface VerifyPayload {
    action: "APPROVE" | "REJECT";
    documentDecisions: {
        type: string;
        status: "APPROVED" | "REJECTED";
        rejectionReason?: string;
    }[];
    globalRejectionReason?: string;
}

const TechnicianVerificationDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();

    const [profile, setProfile] = useState<TechnicianProfileFull | null>(null);
    const [loading, setLoading] = useState(true);
 
    const [decisions, setDecisions] = useState<Record<string, DocDecision>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirm, setShowConfirm] = useState<"APPROVE" | "REJECT" | null>(null);
    const [globalReason, setGlobalReason] = useState("");
    
    // ✅ NEW: State for Lightbox Preview
    const [previewDoc, setPreviewDoc] = useState<{ url: string, type: string } | null>(null);

    useEffect(() => {
        if (id) loadProfile(id);
    }, [id]);

    const loadProfile = async (techId: string) => {
        try {
            setLoading(true);
            const data = await techRepo.getTechnicianProfile(techId); 
            setProfile(data);
 
            const initialDecisions: Record<string, DocDecision> = {};
            data.documents.forEach((doc) => {
                if (doc.status === "APPROVED" || doc.status === "REJECTED") {
                    initialDecisions[doc.type] = {
                        status: doc.status,
                        reason: doc.rejectionReason
                    };
                }
            });
            setDecisions(initialDecisions);
        } catch (err) {
            console.error(err);
            showError("Failed to load technician profile");
            navigate("/admin/technicians/verification");
        } finally {
            setLoading(false);
        }
    };

    const handleDocDecision = (type: string, status: "APPROVED" | "REJECTED") => {
        setDecisions((prev) => {
            const existingReason = prev[type]?.reason || "";
            return {
                ...prev,
                [type]: { 
                    status, 
                    reason: status === "REJECTED" ? existingReason : undefined 
                }
            };
        });
    };

    // ✅ NEW: Bulk Approve Helper
    const approveAllPending = () => {
        if (!profile) return;
        const newDecisions = { ...decisions };
        profile.documents.forEach(doc => {
            if (doc.status === "PENDING" && !newDecisions[doc.type]) {
                newDecisions[doc.type] = { status: "APPROVED" };
            }
        });
        setDecisions(newDecisions);
        showSuccess("All pending documents marked as Approved");
    };

    const handleReasonChange = (type: string, reason: string) => {
        setDecisions((prev) => ({
            ...prev,
            [type]: { ...prev[type], reason }
        }));
    };

    const executeDecision = async () => {
        if (!id || !showConfirm) return;
 
        if (showConfirm === "REJECT") {
            const hasDocRejections = Object.values(decisions).some((d) => d.status === "REJECTED");
            if (!hasDocRejections && !globalReason.trim()) {
                showError("Please provide a rejection reason.");
                return;
            }
        }

        try {
            setIsSubmitting(true);
            
            const payload: VerifyPayload = { 
                action: showConfirm,
                documentDecisions: Object.entries(decisions).map(([type, decision]) => ({
                    type,
                    status: decision.status,
                    rejectionReason: decision.reason
                })),
                globalRejectionReason: globalReason
            };

            await techRepo.verifyTechnician(id, payload);
            showSuccess(showConfirm === "APPROVE" ? "Verified Successfully" : "Application Rejected");
            navigate("/admin/technicians/verification");

        } catch (err: unknown) { 
            const msg = err instanceof Error ? err.message : "Action failed";
            showError(msg);
        } finally {
            setIsSubmitting(false);
            setShowConfirm(null);
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
    if (!profile) return null;

    const isVerified = profile.verificationStatus === "VERIFIED";
    const isRejected = profile.verificationStatus === "REJECTED";

    const getNames = (names?: string[], ids?: string[]) => {
        if (names && names.length > 0) return names;
        return ids || [];
    };

    return (
        <div className="h-full flex flex-col gap-4 sm:gap-6 overflow-hidden bg-gray-50/30">
            {/* --- Header --- */}
            <div className="shrink-0 border-b border-gray-200 pb-4 bg-white px-4 pt-4 sm:px-0 sm:pt-0 sm:bg-transparent">
                <button onClick={() => navigate("/admin/technicians/verification")} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium mb-4 transition-colors">
                    <ArrowLeft size={16} /> <span className="hidden sm:inline">Back to Queue</span><span className="sm:hidden">Back</span>
                </button>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                            {profile.avatarUrl ? <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" /> : <User size={32} className="text-gray-400 m-auto" />}
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 line-clamp-1">{profile.name}</h1>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mt-1">
                                <Calendar size={14} /> 
                                <span>Submitted: {format(new Date(profile.submittedAt), "MMM d, yyyy")}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-xs sm:text-sm border flex items-center gap-2 self-start sm:self-auto ${isVerified ? "bg-green-50 text-green-700 border-green-200" : isRejected ? "bg-red-50 text-red-700 border-red-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                        {isVerified ? <CheckCircle size={16} /> : isRejected ? <XCircle size={16} /> : <AlertTriangle size={16} />}
                        {profile.verificationStatus.replace(/_/g, " ")}
                    </div>
                </div>
            </div>

            {/* --- Main Scrollable Area --- */}
            <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-0 pb-4 space-y-8">
                
                {/* 1. INFO GRID (Personal, Work, Bank) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Personal */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
                        <CardHeader icon={User} title="Personal Details" />
                        <div className="p-5 space-y-4">
                            <InfoRow label="Email" value={profile.email} />
                            <InfoRow label="Phone" value={profile.phone} />
                            <InfoRow label="Bio" value={profile.bio || "No bio provided"} /> 
                            <InfoRow label="Experience" value={profile.experienceSummary} />
                        </div>
                    </div>

                    {/* Work Prefs */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
                        <CardHeader icon={Layers} title="Work Preferences" />
                        <div className="p-5 space-y-5">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Service Zones</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {getNames(profile.zoneNames, profile.zoneIds).map(z => <Badge key={z} text={z} />)}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Categories</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {getNames(profile.categoryNames, profile.categoryIds).map(c => <Badge key={c} text={c} />)}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sub Services</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {getNames(profile.subServiceNames, profile.subServiceIds).map(s => <Badge key={s} text={s} color="blue" />)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bank */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
                        <CardHeader icon={CreditCard} title="Bank Information" />
                        <div className="p-5 space-y-4">
                            <InfoRow label="Account Holder" value={profile.bankDetails?.accountHolderName} />
                            <InfoRow label="Bank Name" value={profile.bankDetails?.bankName} />
                            <InfoRow label="Account Number" value={profile.bankDetails?.accountNumber} isMono />
                            <InfoRow label="IFSC Code" value={profile.bankDetails?.ifscCode} isMono />
                        </div>
                    </div>
                </div>

                {/* 2. DOCUMENTS (COMPACT LIST) */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end px-2">
                        <div className="flex items-center gap-2">
                            <FileText size={20} className="text-gray-500" />
                            <h3 className="text-lg font-bold text-gray-800">Uploaded Documents ({profile.documents.length})</h3>
                        </div>
                        {/* Approve All Utility */}
                        <button onClick={approveAllPending} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors flex items-center gap-1">
                            <Check size={14} /> Approve All Pending
                        </button>
                    </div>

                    {/* ✅ COMPACT LAYOUT: Small Thumbnail + Horizontal Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                        {profile.documents.map((doc, index) => {
                            const decision = decisions[doc.type] || { status: "PENDING" };
                            const isApproved = decision.status === "APPROVED";
                            const isRejected = decision.status === "REJECTED";

                            return (
                                <div key={index} className={`flex items-start bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md p-3 gap-4 ${isRejected ? 'border-red-200 ring-1 ring-red-100' : isApproved ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-200'}`}>
                                    
                                    {/* Small Thumbnail (80px) */}
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0 relative group cursor-pointer" onClick={() => setPreviewDoc({ url: doc.fileUrl, type: doc.type })}>
                                         {doc.fileUrl?.toLowerCase().includes(".pdf") ? (
                                             <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                                                 <FileText size={24} />
                                                 <span className="text-[9px] font-bold uppercase mt-1">PDF</span>
                                             </div>
                                         ) : (
                                             <img src={doc.fileUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" onError={(e) => (e.target as HTMLImageElement).src = "https://via.placeholder.com/80"} alt="doc" />
                                         )}
                                         {/* Hover Overlay */}
                                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                                             <Eye size={16} />
                                         </div>
                                    </div>

                                    {/* Content (Side by Side) */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <h4 className="font-bold text-gray-900 uppercase text-xs tracking-wider">{doc.type.replace(/_/g, " ")}</h4>
                                                <p className="text-xs text-gray-500 mt-0.5 truncate">{doc.fileName}</p>
                                            </div>
                                            {/* Status Badge */}
                                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${isRejected ? 'bg-red-50 text-red-600 border-red-100' : isApproved ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                {isApproved ? 'APPROVED' : isRejected ? 'REJECTED' : doc.status}
                                             </span>
                                        </div>

                                        {/* Action Buttons (Compact) */}
                                        <div className="mt-3 flex gap-2">
                                            <button onClick={() => handleDocDecision(doc.type, "APPROVED")} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold border transition-colors ${isApproved ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 hover:bg-green-50"}`}>
                                                <CheckCircle size={14} /> Approve
                                            </button>
                                            <button onClick={() => handleDocDecision(doc.type, "REJECTED")} className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold border transition-colors ${isRejected ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-600 hover:bg-red-50"}`}>
                                                <XCircle size={14} /> Reject
                                            </button>
                                        </div>

                                        {/* Reason Input (Conditional) */}
                                        {isRejected && (
                                            <div className="mt-2 animate-in fade-in zoom-in-95 duration-200">
                                                <input 
                                                    type="text" 
                                                    placeholder="Reason (e.g. Blurry)" 
                                                    value={decision.reason || ""} 
                                                    onChange={(e) => handleReasonChange(doc.type, e.target.value)} 
                                                    className="w-full px-2 py-1.5 text-xs border border-red-300 rounded focus:ring-1 focus:ring-red-200 outline-none bg-red-50/20" 
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* --- Footer Actions --- */}
            <div className="shrink-0 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3 px-4 sm:px-0 pb-4 bg-white sm:bg-transparent">
                <button onClick={() => setShowConfirm("REJECT")} className="w-full sm:w-auto px-6 py-3 bg-white border border-red-200 text-red-700 rounded-xl font-bold hover:bg-red-50 active:bg-red-100 flex items-center justify-center gap-2 transition-colors touch-manipulation">
                    <Shield size={18} /> Reject
                </button>
                <button onClick={() => setShowConfirm("APPROVE")} disabled={Object.values(decisions).some((d) => d.status === "REJECTED")} className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:bg-blue-800 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation shadow-lg shadow-blue-200">
                    <Briefcase size={18} /> Approve & Onboard
                </button>
            </div>

            {/* Confirmation Modal */}
            <ConfirmModal 
               isOpen={!!showConfirm} 
               onClose={() => setShowConfirm(null)} 
               onConfirm={executeDecision} 
               isLoading={isSubmitting} 
               title={showConfirm === "APPROVE" ? "Approve Technician?" : "Reject Application?"} 
               message={showConfirm === "APPROVE" ? "Technician will be verified." : "Technician will be notified to fix issues."}
               confirmText={showConfirm === "APPROVE" ? "Yes, Approve" : "Yes, Reject"}
               variant={showConfirm === "APPROVE" ? "success" : "danger"}
               customContent={showConfirm === "REJECT" ? (
                   <div className="mt-4"><textarea value={globalReason} onChange={(e) => setGlobalReason(e.target.value)} placeholder="Global Note (Optional)..." className="w-full border p-3 rounded-lg text-sm h-24 focus:outline-none focus:ring-2 focus:ring-red-200 resize-none" /></div>
               ) : undefined}
            />

            {/* ✅ LIGHTBOX PREVIEW MODAL */}
            {previewDoc && (
                <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
                    <button onClick={() => setPreviewDoc(null)} className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 p-2 rounded-full transition-colors">
                        <XCircle size={32} />
                    </button>
                    <div className="w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center text-white mb-2 px-2">
                             <h3 className="font-bold text-lg">{previewDoc.type}</h3>
                             <a href={previewDoc.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-blue-300 hover:text-blue-200"><ExternalLink size={14} /> Open Original</a>
                        </div>
                        <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center relative">
                            {previewDoc.url.toLowerCase().includes(".pdf") ? (
                                <iframe src={previewDoc.url} className="w-full h-full" title="PDF Preview" />
                            ) : (
                                <img src={previewDoc.url} alt="Preview" className="max-w-full max-h-full object-contain" />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Helper Components ---

const CardHeader = ({ icon: Icon, title }: { icon: React.ElementType, title: string }) => (
    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
        <Icon size={18} className="text-gray-500" />
        <h3 className="font-bold text-gray-800">{title}</h3>
    </div>
);

const Badge = ({ text, color = "gray" }: { text: string, color?: "gray" | "blue" }) => (
    <span className={`px-2.5 py-1 text-xs rounded-md font-medium border whitespace-nowrap ${color === "blue" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>{text}</span>
);

const InfoRow = ({ label, value, isMono }: { label: string, value?: string, isMono?: boolean }) => (
    <div className="break-words">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{label}</label>
        <p className={`text-gray-900 font-medium ${isMono ? "font-mono text-sm" : "text-sm"}`}>{value || "--"}</p>
    </div>
);

export default TechnicianVerificationDetails;