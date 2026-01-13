import React, { useState, useEffect } from "react";
import { Landmark, MapPin, Briefcase, FileText, CheckCircle, Eye, Info } from "lucide-react";
import Modal from "../../../components/Shared/Modal/Modal"; 
import * as techRepo from "../../../../infrastructure/repositories/admin/technicianRepository";
import { useNotification } from "../../../hooks/useNotification";
import { FileLightbox } from "../../../components/Shared/FileLightbox/FileLightbox";

// ✅ RECTIFIED: Using 'import type' for all types to satisfy verbatimModuleSyntax
import type { AdminTechnicianProfileDto } from "../../../../domain/types/TechnicianVerificationDtos";
import type { 
    ServiceRequest, 
    ZoneRequest, 
    BankUpdateRequest 
} from "../../../../domain/types/TechnicianRequestTypes";

interface ResolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    technicianId: string;
    onSuccess: () => void;
}

const PartnerRequestResolutionModal: React.FC<ResolutionModalProps> = ({ isOpen, onClose, technicianId, onSuccess }) => {
    const { showError } = useNotification();
    const [profile, setProfile] = useState<AdminTechnicianProfileDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
    const [previewDoc, setPreviewDoc] = useState<{ url: string, type: string } | null>(null);

    useEffect(() => {
        if (isOpen && technicianId) loadDetails();
    }, [isOpen, technicianId]);

    const loadDetails = async () => {
        try {
            setLoading(true);
            const data = await techRepo.getTechnicianProfile(technicianId);
            setProfile(data);
        } catch {
            showError("Failed to load request details");
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (requestType: "BANK" | "SERVICE" | "ZONE", requestId: string, action: "APPROVE" | "REJECT") => {
        const reason = rejectionReasons[requestId] || "";
        if (action === "REJECT" && !reason.trim()) {
            showError("Rejection reason is required");
            return;
        }

        try {
            setIsSubmitting(requestId);
            await techRepo.resolvePartnerRequest(technicianId, {
                requestType,
                requestId,
                action,
                rejectionReason: action === "REJECT" ? reason : undefined
            });
            
            const remainingPending = [
                ...(profile?.bankUpdateRequests || []),
                ...(profile?.serviceRequests || []),
                ...(profile?.zoneRequests || [])
            ].filter(r => r.id !== requestId && r.status === "PENDING").length;

            if (remainingPending === 0) {
                onSuccess();
            } else {
                loadDetails();
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to resolve request";
            showError(msg);
        } finally {
            setIsSubmitting(null);
        }
    };

    if (loading || !profile) return (
        <Modal isOpen={isOpen} onClose={onClose} title="Reviewing Profile..." maxWidth="max-w-4xl">
             <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-gray-500">Fetching evidence...</p>
             </div>
        </Modal>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Review Requests: ${profile.name}`} maxWidth="max-w-4xl">
            <div className="space-y-8">
                {/* BANK REQUESTS */}
                {profile.bankUpdateRequests?.filter(r => r.status === "PENDING").map((req: BankUpdateRequest) => (
                    <div key={req.id} className="bg-orange-50/50 border border-orange-100 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-orange-100/50 px-6 py-3 border-b border-orange-200 flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-orange-800">
                                <Landmark size={18} /> Financial: Bank Account Update
                            </div>
                            <span className="text-[10px] bg-orange-200 text-orange-900 px-2 py-0.5 rounded-full font-bold">PAUSES PAYOUTS</span>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5"><Info size={12}/> Current Details</h4>
                                <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-2 opacity-60">
                                    <DetailRow label="Account" value={profile.bankDetails?.accountNumber} />
                                    <DetailRow label="Bank" value={profile.bankDetails?.bankName} />
                                    <DetailRow label="IFSC" value={profile.bankDetails?.ifscCode} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1.5"><CheckCircle size={12}/> New Requested Details</h4>
                                <div className="p-4 bg-white border border-blue-200 rounded-xl space-y-2 shadow-sm ring-2 ring-blue-50/50">
                                    <DetailRow label="Account" value={req.accountNumber} bold />
                                    <DetailRow label="Bank" value={req.bankName} bold />
                                    <DetailRow label="IFSC" value={req.ifscCode} bold />
                                    <button 
                                        onClick={() => setPreviewDoc({ url: req.proofUrl, type: "BANK_PASSBOOK" })}
                                        className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100"
                                    >
                                        <Eye size={14} /> View Passbook Photo
                                    </button>
                                </div>
                            </div>
                        </div>
                        <ActionPanel 
                            onApprove={() => handleAction("BANK", req.id, "APPROVE")} 
                            onReject={() => handleAction("BANK", req.id, "REJECT")} 
                            isSubmitting={isSubmitting === req.id}
                            reason={rejectionReasons[req.id] || ""}
                            onReasonChange={(val) => setRejectionReasons(prev => ({ ...prev, [req.id]: val }))}
                        />
                    </div>
                ))}

                {/* SERVICE REQUESTS */}
                {profile.serviceRequests?.filter(r => r.status === "PENDING").map((req: ServiceRequest) => (
                    <div key={req.id} className="bg-blue-50/50 border border-blue-100 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-blue-100/50 px-6 py-3 border-b border-blue-200 flex items-center gap-2 font-bold text-blue-800 uppercase text-xs tracking-wide">
                            <Briefcase size={16} /> Operational: New Service Addition
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between p-5 bg-white border border-blue-200 rounded-xl shadow-sm">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">Requested Sub-Service: {req.serviceId}</h4>
                                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-tight">Status: PENDING ADMIN REVIEW</p>
                                </div>
                                {req.proofUrl && (
                                    <button 
                                        onClick={() => setPreviewDoc({ url: req.proofUrl, type: "CERTIFICATE" })}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                                    >
                                        <FileText size={14} /> View Certification
                                    </button>
                                )}
                            </div>
                        </div>
                        <ActionPanel 
                            onApprove={() => handleAction("SERVICE", req.id, "APPROVE")} 
                            onReject={() => handleAction("SERVICE", req.id, "REJECT")} 
                            isSubmitting={isSubmitting === req.id}
                            reason={rejectionReasons[req.id] || ""}
                            onReasonChange={(val) => setRejectionReasons(prev => ({ ...prev, [req.id]: val }))}
                        />
                    </div>
                ))}

                {/* ZONE REQUESTS */}
                {profile.zoneRequests?.filter(r => r.status === "PENDING").map((req: ZoneRequest) => (
                    <div key={req.id} className="bg-purple-50/50 border border-purple-100 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-purple-100/50 px-6 py-3 border-b border-purple-200 flex items-center gap-2 font-bold text-purple-800 uppercase text-xs tracking-wide">
                            <MapPin size={16} /> Location: Zone Transfer Request
                        </div>
                        <div className="p-6 flex items-center justify-center gap-6">
                            <div className="flex-1 p-4 bg-white border border-gray-200 rounded-xl text-center opacity-60">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Current Zone</p>
                                <p className="text-sm font-medium mt-1">{req.currentZoneId}</p>
                            </div>
                            <div className="w-8 flex items-center justify-center text-purple-300">
                                <CheckCircle size={20} />
                            </div>
                            <div className="flex-1 p-4 bg-white border border-purple-200 rounded-xl text-center shadow-sm ring-2 ring-purple-50/50">
                                <p className="text-[10px] font-bold text-purple-600 uppercase">Requested Zone</p>
                                <p className="text-sm font-bold mt-1 text-purple-900">{req.requestedZoneId}</p>
                            </div>
                        </div>
                        <ActionPanel 
                            onApprove={() => handleAction("ZONE", req.id, "APPROVE")} 
                            onReject={() => handleAction("ZONE", req.id, "REJECT")} 
                            isSubmitting={isSubmitting === req.id}
                            reason={rejectionReasons[req.id] || ""}
                            onReasonChange={(val) => setRejectionReasons(prev => ({ ...prev, [req.id]: val }))}
                        />
                    </div>
                ))}
            </div>

            {previewDoc && (
                <FileLightbox 
                    url={previewDoc.url} 
                    type={previewDoc.type} 
                    title={previewDoc.type.replace(/_/g, " ")} 
                    onClose={() => setPreviewDoc(null)} 
                />
            )}
        </Modal>
    );
};

const DetailRow = ({ label, value, bold }: { label: string, value?: string, bold?: boolean }) => (
    <div className="flex justify-between text-xs">
        <span className="text-gray-500">{label}:</span>
        <span className={`${bold ? "font-bold text-gray-900" : "text-gray-700"}`}>{value || "Not Set"}</span>
    </div>
);

const ActionPanel = ({ onApprove, onReject, isSubmitting, reason, onReasonChange }: { onApprove: () => void, onReject: () => void, isSubmitting: boolean, reason: string, onReasonChange: (val: string) => void }) => (
    <div className="bg-white/80 px-6 py-4 border-t border-gray-100 flex flex-col gap-3">
        <textarea 
            placeholder="Explain the reason for rejection (required)..."
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-100 outline-none h-20 resize-none placeholder:text-gray-300"
        />
        <div className="flex justify-end gap-3">
            <button 
                onClick={onReject} 
                disabled={isSubmitting} 
                className="px-5 py-2 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
                {isSubmitting ? "Processing..." : "Reject Ticket"}
            </button>
            <button 
                onClick={onApprove} 
                disabled={isSubmitting} 
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-all shadow-md shadow-green-100 disabled:opacity-50"
            >
                {isSubmitting ? "Approving..." : "Approve Update"}
            </button>
        </div>
    </div>
);

export default PartnerRequestResolutionModal;