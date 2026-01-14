import React, { useState, useEffect, useCallback } from "react";
import { Landmark, MapPin, Briefcase, Eye, ArrowRight, Info, CheckCircle, XCircle } from "lucide-react";
import Modal from "../../../components/Shared/Modal/Modal";
import * as techRepo from "../../../../infrastructure/repositories/admin/technicianRepository";
import { useNotification } from "../../../hooks/useNotification";
import { FileLightbox } from "../../../components/Shared/FileLightbox/FileLightbox";

import type { AdminTechnicianProfileDto } from "../../../../domain/types/TechnicianVerificationDtos";
import type { ServiceRequest, ZoneRequest, BankUpdateRequest } from "../../../../domain/types/TechnicianRequestTypes";

interface ResolutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    technicianId: string;
    onSuccess: () => void;
}

const PartnerRequestResolutionModal: React.FC<ResolutionModalProps> = ({ isOpen, onClose, technicianId, onSuccess }) => {
    const { showError, showSuccess } = useNotification();
    const [profile, setProfile] = useState<AdminTechnicianProfileDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState<string | null>(null);
    const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
    const [previewDoc, setPreviewDoc] = useState<{ url: string, type: string } | null>(null);

    // Track which request IDs are in a "Rejection Flow" to show/hide the note input
    const [showRejectionInput, setShowRejectionInput] = useState<Record<string, boolean>>({});

    const loadDetails = useCallback(async () => {
        try {
            setLoading(true);
            const response = await techRepo.getTechnicianProfile(technicianId);
            const data = response as unknown as AdminTechnicianProfileDto;

            const formattedProfile: AdminTechnicianProfileDto = {
                ...data,
                zoneNames: data.zoneNames || [],
                categoryNames: data.categoryNames || [],
                subServiceNames: data.subServiceNames || [],
                serviceRequests: data.serviceRequests || [],
                zoneRequests: data.zoneRequests || [],
                bankUpdateRequests: data.bankUpdateRequests || [],
                payoutStatus: data.payoutStatus || "ACTIVE",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                documents: (data.documents || []).map((doc: any) => ({
                    ...doc,
                    status: doc.status === "VERIFICATION_PENDING" ? "PENDING" : doc.status,
                })),
            };

            setProfile(formattedProfile);
        } catch {
            showError("Failed to fetch audit data");
            onClose();
        } finally {
            setLoading(false);
        }
    }, [technicianId, showError, onClose]);

    const getResolvedName = (type: 'SERVICE' | 'ZONE' | 'CATEGORY', id: string): string => {
        if (!profile) return id;
        let mappingList: { id: string, name: string }[] = [];
        if (type === 'SERVICE') mappingList = profile.subServiceNames;
        else if (type === 'ZONE') mappingList = profile.zoneNames;
        else if (type === 'CATEGORY') mappingList = profile.categoryNames;
        const resolved = mappingList.find(item => item.id === id);
        return resolved ? resolved.name : id;
    };

    useEffect(() => {
        if (isOpen && technicianId) loadDetails();
    }, [isOpen, technicianId, loadDetails]);

    const handleAction = async (requestType: "BANK" | "SERVICE" | "ZONE", requestId: string, action: "APPROVE" | "REJECT") => {
        const reason = rejectionReasons[requestId] || "";

        // Logical check for mandatory reason during rejection
        if (action === "REJECT" && !reason.trim()) {
            showError("Please provide a reason for the rejection.");
            return;
        }

        try {
            setIsSubmitting(requestId);
            await techRepo.resolvePartnerRequest(technicianId, {
                requestType, requestId, action,
                rejectionReason: action === "REJECT" ? reason : undefined
            });

            showSuccess(`Request ${action === "APPROVE" ? "Approved" : "Rejected"} successfully`);

            const remaining = [
                ...(profile?.bankUpdateRequests || []),
                ...(profile?.serviceRequests || []),
                ...(profile?.zoneRequests || [])
            ].filter(r => r.id !== requestId && r.status === "PENDING").length;

            if (remaining === 0) onSuccess();
            else loadDetails();
        } catch (err: unknown) {
            showError(err instanceof Error ? err.message : "Action failed");
        } finally {
            setIsSubmitting(null);
        }
    };

    if (loading || !profile) return (
        <Modal isOpen={isOpen} onClose={onClose} title="Auditing Profile..." maxWidth="max-w-2xl">
            <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Syncing Evidence...</p>
            </div>
        </Modal>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Audit Hub: ${profile.name}`} maxWidth="max-w-2xl">
            <div className="space-y-8 md:space-y-10 py-2">

                {/* FINANCIAL SYNC */}
                {profile.bankUpdateRequests?.filter(r => r.status === "PENDING").map((req: BankUpdateRequest) => (
                    <AuditCard key={req.id} title="Financial " Icon={Landmark} theme="orange">
                        <div className="flex flex-col md:grid md:grid-cols-11 items-center gap-4">
                            <div className="w-full md:col-span-5 space-y-2">
                                <Label text="Active Record" />
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl opacity-40 grayscale">
                                    <DetailItem label="Bank" value={profile.bankDetails?.bankName} />
                                    <DetailItem label="Account" value={profile.bankDetails?.accountNumber} />
                                </div>
                            </div>
                            <div className="flex justify-center text-slate-300 rotate-90 md:rotate-0">
                                <ArrowRight size={24} strokeWidth={3} />
                            </div>
                            <div className="w-full md:col-span-5 space-y-2">
                                <Label text="Proposed Update" active />
                                <div className="p-4 bg-blue-50/30 border-2 border-blue-100 rounded-2xl">
                                    <DetailItem label="Bank" value={req.bankName} bold />
                                    <DetailItem label="Account" value={req.accountNumber} bold />
                                    <button onClick={() => setPreviewDoc({ url: req.proofUrl, type: "PASSBOOK" })} className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all">
                                        <Eye size={14} /> View Evidence
                                    </button>
                                </div>
                            </div>
                        </div>
                        <AuditFooter
                            onApprove={() => handleAction("BANK", req.id, "APPROVE")}
                            onReject={() => handleAction("BANK", req.id, "REJECT")}
                            isLoading={isSubmitting === req.id}
                            reason={rejectionReasons[req.id] || ""}
                            onReasonChange={(val) => setRejectionReasons(prev => ({ ...prev, [req.id]: val }))}
                            showNote={showRejectionInput[req.id] || false}
                            onToggleNote={(val) => setShowRejectionInput(prev => ({ ...prev, [req.id]: val }))}
                        />
                    </AuditCard>
                ))}

                {/* SKILLSET SYNC */}
                {profile.serviceRequests?.filter(r => r.status === "PENDING").map((req: ServiceRequest) => {
                    const isRemoval = req.action === "REMOVE";

                    return (
                        <AuditCard
                            key={req.id}
                            title={isRemoval ? "Skillset Deletion" : "Skillset Expansion"}
                            Icon={Briefcase}
                            theme={isRemoval ? "orange" : "blue"}
                        >
                            <div className={`p-4 rounded-2xl border ${isRemoval ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-200"}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Label text="Category" />
                                        <h4 className="font-bold">{getResolvedName('CATEGORY', req.categoryId)}</h4>
                                        <div className="mt-2">
                                            <Label text={isRemoval ? "Service to REMOVE" : "Service to ADD"} active />
                                            <h3 className={`text-lg md:text-xl font-bold mt-1 ${req.action === "REMOVE" ? "text-red-600" : "text-slate-800"}`}>
                                                {getResolvedName('SERVICE', req.serviceId)}
                                                {req.action === "REMOVE" && " (REMOVAL)"}
                                            </h3>
                                        </div>
                                    </div>
                                    {isRemoval && (
                                        <div className="px-3 py-1 bg-red-600 text-white text-[10px] font-bold rounded-full uppercase">
                                            Removal Request
                                        </div>
                                    )}
                                </div>
                            </div>
                            <AuditFooter
                                onApprove={() => handleAction("SERVICE", req.id, "APPROVE")}
                                onReject={() => handleAction("SERVICE", req.id, "REJECT")}
                                isLoading={isSubmitting === req.id}
                                reason={rejectionReasons[req.id] || ""}
                                onReasonChange={(val) => setRejectionReasons(prev => ({ ...prev, [req.id]: val }))}
                                showNote={showRejectionInput[req.id] || false}
                                onToggleNote={(val) => setShowRejectionInput(prev => ({ ...prev, [req.id]: val }))}
                            />
                        </AuditCard>
                    );
                })}

                {/* LOGISTICS SYNC */}
                {profile.zoneRequests?.filter(r => r.status === "PENDING").map((req: ZoneRequest) => (
                    <AuditCard key={req.id} title="Territory Relocation" Icon={MapPin} theme="purple">
                        <div className="flex flex-col md:grid md:grid-cols-11 items-center gap-4">
                            <div className="w-full md:col-span-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center opacity-40">
                                <Label text="Origin Zone" />
                                <p className="text-sm md:text-base font-bold mt-1 text-slate-700">
                                    {getResolvedName('ZONE', req.currentZoneId)}
                                </p>
                            </div>
                            <div className="flex justify-center text-slate-300 rotate-90 md:rotate-0">
                                <ArrowRight size={24} strokeWidth={3} />
                            </div>
                            <div className="w-full md:col-span-5 p-4 bg-purple-50/50 border-2 border-purple-100 rounded-2xl text-center">
                                <Label text="Destination Zone" active />
                                <p className="text-sm md:text-base font-bold mt-1 text-purple-900">
                                    {getResolvedName('ZONE', req.requestedZoneId)}
                                </p>
                            </div>
                        </div>
                        <AuditFooter
                            onApprove={() => handleAction("ZONE", req.id, "APPROVE")}
                            onReject={() => handleAction("ZONE", req.id, "REJECT")}
                            isLoading={isSubmitting === req.id}
                            reason={rejectionReasons[req.id] || ""}
                            onReasonChange={(val) => setRejectionReasons(prev => ({ ...prev, [req.id]: val }))}
                            showNote={showRejectionInput[req.id] || false}
                            onToggleNote={(val) => setShowRejectionInput(prev => ({ ...prev, [req.id]: val }))}
                        />
                    </AuditCard>
                ))}
            </div>
            {previewDoc && <FileLightbox url={previewDoc.url} type={previewDoc.type} title={previewDoc.type} onClose={() => setPreviewDoc(null)} />}
        </Modal >
    );
};

interface AuditCardProps {
    title: string;
    Icon: React.ElementType;
    theme: "orange" | "blue" | "purple";
    children: React.ReactNode;
}

const AuditCard: React.FC<AuditCardProps> = ({ title, Icon, theme, children }) => {
    const accents: Record<string, string> = {
        orange: "border-orange-100 bg-orange-50/30",
        blue: "border-blue-100 bg-blue-50/30",
        purple: "border-purple-100 bg-purple-50/30"
    };
    return (
        <div className={`border-2 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm ${accents[theme]}`}>
            <div className="px-4 md:px-6 py-3 border-b border-inherit bg-white/50 flex items-center justify-between font-bold text-[9px] md:text-[10px] uppercase tracking-widest text-slate-700">
                <div className="flex items-center gap-2"><Icon size={14} className="md:w-4 md:h-4" /> {title}</div>
                <div className="hidden sm:flex items-center gap-1.5"><Info size={12} /> Verification REQUIRED</div>
            </div>
            <div className="p-4 md:p-8 space-y-6 md:space-y-8">{children}</div>
        </div>
    );
};

const Label = ({ text, active }: { text: string; active?: boolean }) => (
    <p className={`text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] mb-1 ${active ? "text-blue-600" : "text-gray-400"}`}>{text}</p>
);

const DetailItem = ({ label, value, bold }: { label: string; value?: string; bold?: boolean }) => (
    <div className="flex justify-between items-center py-1">
        <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</span>
        <span className={`text-[11px] md:text-sm ${bold ? "font-bold text-slate-800" : "font-medium text-slate-600"} truncate ml-2`}>{value || "N/A"}</span>
    </div>
);

interface AuditActionsProps {
    onApprove: () => void;
    onReject: () => void;
    isLoading: boolean;
    reason: string;
    onReasonChange: (val: string) => void;
    showNote: boolean;
    onToggleNote: (val: boolean) => void;
}

const AuditActions: React.FC<AuditActionsProps> = ({ onApprove, onReject, isLoading, reason, onReasonChange, showNote, onToggleNote }) => (
    <div className="pt-4 md:pt-8 border-t border-slate-200/50 space-y-4">
        {showNote && (
            <textarea
                placeholder="Please state the reason for rejection (required)..."
                value={reason}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onReasonChange(e.target.value)}
                className="w-full text-sm font-medium border-2 border-red-100 bg-red-50/30 rounded-xl md:rounded-2xl p-3 md:p-4 h-20 md:h-24 outline-none focus:border-red-200 transition-all placeholder:text-red-300 resize-none animate-in fade-in slide-in-from-top-1"
            />
        )}
        <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
            <button
                onClick={() => {
                    if (!showNote) onToggleNote(true);
                    else onReject();
                }}
                disabled={isLoading}
                className="order-2 sm:order-1 flex-1 py-3 md:py-3.5 bg-white text-red-600 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-red-50 border-2 border-red-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
                <XCircle size={14} /> {isLoading ? "..." : "Reject request"}
            </button>
            <button
                onClick={onApprove}
                disabled={isLoading}
                className="order-1 sm:order-2 flex-[2] py-3 md:py-3.5 bg-green-600 text-white rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-green-700 shadow-lg shadow-green-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
                <CheckCircle size={14} /> {isLoading ? "..." : "Approve "}
            </button>
        </div>
    </div>
);

const AuditFooter = AuditActions;

export default PartnerRequestResolutionModal;