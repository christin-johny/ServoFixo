import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    User,
    CreditCard,
    FileText,
    Shield,
    AlertTriangle,
    ExternalLink,
    MapPin,
    Briefcase
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

    useEffect(() => {
        if (id) loadProfile(id);
    }, [id]);

    const loadProfile = async (techId: string) => {
        try {
            setLoading(true);
            const data = await techRepo.getTechnicianProfile(techId);
            setProfile(data);
 
            const initialDecisions: Record<string, DocDecision> = {};
            data.documents.forEach(doc => {
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
        setDecisions(prev => ({
            ...prev,
            [type]: { status, reason: status === "APPROVED" ? undefined : "" }
        }));
    };

    const handleReasonChange = (type: string, reason: string) => {
        setDecisions(prev => ({
            ...prev,
            [type]: { ...prev[type], reason }
        }));
    };

    const executeDecision = async () => {
        if (!id || !showConfirm) return;
 
        if (showConfirm === "REJECT") {
            const hasDocRejections = Object.values(decisions).some(d => d.status === "REJECTED");
            if (!hasDocRejections && !globalReason.trim()) {
                showError("Please provide a rejection reason (either reject a specific document or add a global note).");
                return;
            }
        }

        try {
            setIsSubmitting(true);

            const payload: techRepo.VerifyActionPayload = {
                action: showConfirm,
                documentDecisions: Object.entries(decisions).map(([type, decision]) => ({
                    type,
                    status: decision.status,
                    rejectionReason: decision.reason
                })),
                globalRejectionReason: globalReason
            };

            await techRepo.verifyTechnician(id, payload);

            showSuccess(showConfirm === "APPROVE" ? "Technician Verified Successfully" : "Technician Application Rejected");
            navigate("/admin/technicians/verification");

        } catch (err: unknown) { 
            let message = "Action failed";
            if (err instanceof Error) message = err.message;
            showError(message);
        } finally {
            setIsSubmitting(false);
            setShowConfirm(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) return null;

    const isVerified = profile.verificationStatus === "VERIFIED";
    const isRejected = profile.verificationStatus === "REJECTED";

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">

            {/* 1. Header with Back Button & Status */}
            <div className="shrink-0 border-b border-gray-200 pb-4">
                <button
                    onClick={() => navigate("/admin/technicians/verification")}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium mb-3 transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Queue
                </button>

                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={32} /></div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1"><MapPin size={14} /> Zone ID: {profile.zoneIds[0] || "N/A"}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span>Submitted: {format(new Date(profile.submittedAt), "MMM d, yyyy")}</span>
                            </div>
                        </div>
                    </div>

                    <div className={`px-4 py-2 rounded-lg font-bold text-sm border flex items-center gap-2
            ${isVerified ? "bg-green-50 text-green-700 border-green-200" :
                            isRejected ? "bg-red-50 text-red-700 border-red-200" :
                                "bg-blue-50 text-blue-700 border-blue-200"}`
                    }>
                        {isVerified ? <CheckCircle size={18} /> : isRejected ? <XCircle size={18} /> : <AlertTriangle size={18} />}
                        {profile.verificationStatus.replace("_", " ")}
                    </div>
                </div>
            </div>

            {/* 2. Main Scrollable Content */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-2">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column: Personal & Bank Info */}
                    <div className="space-y-6 lg:col-span-1">

                        {/* Personal Details Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                <User size={18} className="text-gray-500" />
                                <h3 className="font-bold text-gray-800">Personal Details</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                <InfoRow label="Email" value={profile.email} />
                                <InfoRow label="Phone" value={profile.phone} />
                                <InfoRow label="Experience" value={profile.experienceSummary} />
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase">Categories</label>
                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                        {profile.categoryIds.map(cat => (
                                            <span key={cat} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium border border-gray-200">
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bank Details Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                                <CreditCard size={18} className="text-gray-500" />
                                <h3 className="font-bold text-gray-800">Bank Information</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                <InfoRow label="Account Holder" value={profile.bankDetails?.accountHolderName} />
                                <InfoRow label="Bank Name" value={profile.bankDetails?.bankName} />
                                <InfoRow label="Account Number" value={profile.bankDetails?.accountNumber} isMono />
                                <InfoRow label="IFSC Code" value={profile.bankDetails?.ifscCode} isMono />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Documents Review */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <FileText size={18} className="text-gray-500" />
                                    <h3 className="font-bold text-gray-800">Documents Verification</h3>
                                </div>
                                <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border">
                                    {profile.documents.length} Files Uploaded
                                </span>
                            </div>

                            <div className="p-6 space-y-6 flex-1">
                                {profile.documents.map((doc, index) => {
                                    const decision = decisions[doc.type] || { status: "PENDING" };
                                    const isApproved = decision.status === "APPROVED";
                                    const isRejected = decision.status === "REJECTED";

                                    return (
                                        <div key={index} className={`flex flex-col sm:flex-row gap-5 p-4 rounded-xl border transition-all ${isRejected ? 'border-red-200 bg-red-50/30' : isApproved ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
                                            {/* Image Thumbnail */}
                                            <div className="w-full sm:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shrink-0 relative group">

                                                {/* CONDITION: Check if PDF or Image */}
                                                {isPdf(doc.fileUrl) ? ( 
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-500">
                                                        <FileText size={32} className="mb-2 opacity-80" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">PDF Document</span>
                                                    </div>
                                                ) : ( 
                                                    <img
                                                        src={doc.fileUrl}
                                                        alt={doc.type}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { 
                                                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/150?text=No+Preview";
                                                        }}
                                                    />
                                                )}
 
                                                <a
                                                    href={doc.fileUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity backdrop-blur-[1px]"
                                                >
                                                    <div className="flex flex-col items-center gap-2">
                                                        <ExternalLink size={24} />
                                                        <span className="text-xs font-bold">View File</span>
                                                    </div>
                                                </a>
                                            </div>

                                            {/* Info & Controls */}
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 uppercase tracking-wide text-sm">{doc.type.replace(/_/g, " ")}</h4>
                                                        <p className="text-xs text-gray-500 mt-1">{doc.fileName}</p>
                                                    </div>

                                                    {/* Status Badge (Server Status) */}
                                                    {doc.status !== "PENDING" && (
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${doc.status === "APPROVED" ? "bg-green-100 text-green-700 border-green-200" :
                                                                doc.status === "REJECTED" ? "bg-red-100 text-red-700 border-red-200" : "bg-gray-100 text-gray-600"
                                                            }`}>
                                                            Current: {doc.status}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Decision Buttons */}
                                                <div className="mt-4">
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => handleDocDecision(doc.type, "APPROVED")}
                                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold border transition-all ${isApproved
                                                                    ? "bg-green-600 text-white border-green-600 shadow-sm"
                                                                    : "bg-white text-gray-600 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                                                                }`}
                                                        >
                                                            <CheckCircle size={16} /> Approve
                                                        </button>

                                                        <button
                                                            onClick={() => handleDocDecision(doc.type, "REJECTED")}
                                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold border transition-all ${isRejected
                                                                    ? "bg-red-600 text-white border-red-600 shadow-sm"
                                                                    : "bg-white text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                                                                }`}
                                                        >
                                                            <XCircle size={16} /> Reject
                                                        </button>
                                                    </div>

                                                    {/* Rejection Reason Input */}
                                                    {isRejected && (
                                                        <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Reason for rejection (e.g. Blurry Image)"
                                                                value={decision.reason || ""}
                                                                onChange={(e) => handleReasonChange(doc.type, e.target.value)}
                                                                className="w-full px-3 py-2 text-sm border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200 bg-white"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Footer Actions */}
            <div className="shrink-0 pt-4 border-t border-gray-200 flex justify-end gap-4">
                <button
                    onClick={() => setShowConfirm("REJECT")}
                    className="px-6 py-3 bg-white border border-red-200 text-red-700 rounded-xl font-bold text-sm hover:bg-red-50 shadow-sm transition-colors flex items-center gap-2"
                >
                    <Shield size={18} /> Reject Application
                </button>
                <button
                    onClick={() => setShowConfirm("APPROVE")}
                    disabled={Object.values(decisions).some(d => d.status === "REJECTED")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-md shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Briefcase size={18} /> Approve & Onboard
                </button>
            </div>

            {/* Final Confirmation Modal */}
            <ConfirmModal
                isOpen={!!showConfirm}
                onClose={() => setShowConfirm(null)}
                onConfirm={executeDecision}
                isLoading={isSubmitting}
                title={showConfirm === "APPROVE" ? "Approve Technician?" : "Reject Application?"}
                message={showConfirm === "APPROVE"
                    ? "This technician will be marked as Verified and can immediately start accepting jobs."
                    : "The technician will be notified to fix the rejected documents."}
                confirmText={showConfirm === "APPROVE" ? "Yes, Approve" : "Yes, Reject"}
                variant={showConfirm === "APPROVE" ? "success" : "danger"} 
                customContent={showConfirm === "REJECT" ? (
                    <div className="mt-4">
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Overall Note (Optional)</label>
                        <textarea
                            value={globalReason}
                            onChange={(e) => setGlobalReason(e.target.value)}
                            placeholder="Add a general note for the technician..."
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm h-20 focus:outline-none focus:ring-2 focus:ring-red-200"
                        />
                    </div>
                ) : undefined}
            />
        </div>
    );
};
 
const InfoRow = ({ label, value, isMono = false }: { label: string, value?: string, isMono?: boolean }) => (
    <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{label}</label>
        <p className={`text-gray-900 font-medium ${isMono ? "font-mono text-sm" : "text-sm"}`}>{value || "--"}</p>
    </div>
);
const isPdf = (url: string) => url?.toLowerCase().includes(".pdf");

export default TechnicianVerificationDetails;