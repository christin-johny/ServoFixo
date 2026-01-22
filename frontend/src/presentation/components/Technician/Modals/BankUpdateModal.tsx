import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { z } from "zod";
import {
    Loader2, Upload, AlertTriangle, Check, X,
    CreditCard, Landmark, User, Hash, Search, CheckCircle2, AlertCircle, ShieldCheck
} from "lucide-react";

import Modal from "../../Shared/Modal/Modal";
import { addBankRequest } from "../../../../store/technicianSlice";
import {
    requestBankUpdate,
    uploadDocument
} from "../../../../infrastructure/repositories/technician/technicianProfileRepository";
import { technicianOnboardingRepository } from "../../../../infrastructure/repositories/technician/technicianOnboardingRepository";
import { useNotification } from "../../../hooks/useNotification";
import { type BankUpdateRequest } from "../../../../domain/types/TechnicianRequestTypes";

// --- VALIDATION SCHEMA (Mirrors Step 6) ---
const bankUpdateSchema = z.object({
    accountHolderName: z
        .string()
        .min(3, "Name must be at least 3 characters")
        .regex(/^[a-zA-Z\s.]+$/, "Name should only contain letters and spaces"),

    accountNumber: z
        .string()
        .min(9, "Account number is too short (min 9 digits)")
        .max(18, "Account number is too long (max 18 digits)")
        .regex(/^\d+$/, "Account number must contain only digits"),

    confirmAccountNumber: z
        .string(),

    ifscCode: z
        .string()
        .length(11, "IFSC Code must be exactly 11 characters")
        .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC format (e.g., SBIN0001234)"),

    bankName: z
        .string()
        .min(1, "Please enter a valid IFSC code to verify the bank"),
}).refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Account numbers do not match",
    path: ["confirmAccountNumber"],
});

interface BankUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const BankUpdateModal: React.FC<BankUpdateModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const { showSuccess, showError } = useNotification();

    // --- Form State ---
    const [formData, setFormData] = useState({
        accountHolderName: "",
        accountNumber: "",
        confirmAccountNumber: "",
        ifscCode: "",
        bankName: "",
        branchName: "",
        upiId: ""
    });

    const [file, setFile] = useState<File | null>(null);
    const [isIfscValidating, setIsIfscValidating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [ifscVerified, setIfscVerified] = useState(false);

    // --- IFSC AUTO-DETECTION (Debounced) ---
    useEffect(() => {
        const fetchIfsc = async () => {
            const code = formData.ifscCode.toUpperCase();
            // Strict Regex for IFSC: 4 Letters, 0, 6 Alphanumeric
            const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

            if (code.length === 11) {
                if (!ifscRegex.test(code)) {
                    showError("Invalid IFSC format. Must be 4 letters, 0, then 6 chars.");
                    setIfscVerified(false);
                    setFormData(prev => ({ ...prev, bankName: "", branchName: "" }));
                    return;
                }

                try {
                    setIsIfscValidating(true);
                    const data = await technicianOnboardingRepository.fetchBankDetailsByIfsc(code);

                    if (!data || !data.BANK) throw new Error("Bank not found");

                    setFormData(prev => ({
                        ...prev,
                        bankName: data.BANK,
                        branchName: data.BRANCH || "Main Branch"
                    }));
                    setIfscVerified(true);
                    showSuccess(`Verified: ${data.BANK}`);
                } catch {
                    setIfscVerified(false);
                    setFormData(prev => ({ ...prev, bankName: "", branchName: "" }));
                    showError("IFSC Code not found in banking database.");
                } finally {
                    setIsIfscValidating(false);
                }
            } else {
                if (ifscVerified && code.length < 11) {
                    setIfscVerified(false);
                    setFormData(prev => ({ ...prev, bankName: "", branchName: "" }));
                }
            }
        };

        const timeoutId = setTimeout(() => {
            if (formData.ifscCode) fetchIfsc();
        }, 600); // Debounce

        return () => clearTimeout(timeoutId);
    }, [formData.ifscCode]);

    // --- HANDLERS ---

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Strict Input Constraints (Mirroring Step 6)
        if ((name === "accountNumber" || name === "confirmAccountNumber")) {
            if (!/^\d*$/.test(value)) return;
        }

        if (name === "ifscCode") {
            if (!/^[A-Za-z0-9]*$/.test(value)) return;
        }

        if (name === "accountHolderName") {
            if (!/^[a-zA-Z\s.]*$/.test(value)) return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: name === "ifscCode" ? value.toUpperCase() : value
        }));
    };

    // Auto Trim on Blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value.trim() }));
    };
 
    const handlePastePrevent = (e: React.ClipboardEvent) => {
        e.preventDefault();
        showError("For security, please type the account number manually.");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            if (selected.size > 5 * 1024 * 1024) {
                showError("File size must be less than 5MB");
                return;
            }
            setFile(selected);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = bankUpdateSchema.safeParse(formData);
        if (!validation.success) {
            showError(validation.error.errors[0].message);
            return;
        }

        if (!file) {
            showError("Please upload a proof document (Passbook/Cheque).");
            return;
        }

        try {
            setIsSubmitting(true);

            // 2. Upload Proof
            setIsUploading(true);
            const proofUrl = await uploadDocument(file, "documents");
            setIsUploading(false);

            // 3. Submit Request
            const payload = {
                accountHolderName: formData.accountHolderName,
                accountNumber: formData.accountNumber,
                bankName: formData.bankName,
                ifscCode: formData.ifscCode,
                upiId: formData.upiId,
                proofUrl
            };

            await requestBankUpdate(payload);
 
            const optimisticRequest: BankUpdateRequest = {
                ...payload,
                id: `bnk-${Date.now()}`,  
                status: "PENDING",
                adminComments: "",
                requestedAt: new Date().toISOString(),
                isDismissed: false,  
                isArchived: false    
            };

            dispatch(addBankRequest(optimisticRequest));

            showSuccess("Bank update requested. Payouts paused until approval.");
            handleClose();

        } catch (err: unknown) {
            const msg =
                typeof err === "object" &&
                    err !== null &&
                    "response" in err &&
                    typeof (err as { response?: { data?: { error?: string } } }).response?.data?.error === "string"
                    ? (err as { response: { data: { error: string } } }).response.data.error
                    : "Failed to submit request.";

            showError(msg);
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            accountHolderName: "",
            accountNumber: "",
            confirmAccountNumber: "",
            ifscCode: "",
            bankName: "",
            branchName: "",
            upiId: ""
        });
        setFile(null);
        setIfscVerified(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Update Bank Details" maxWidth="max-w-2xl">
            <div className="space-y-6">

                {/* Critical Warning Banner */}
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 items-start">
                    <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800">
                        <p className="font-bold">Important Security Notice</p>
                        <p className="mt-1">
                            Updating your bank details will <strong>immediately pause all payouts</strong>.
                            Admin verification typically takes 24-48 hours. Please upload a clear photo
                            of your Passbook or Cancelled Cheque matching the new details.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Account Holder */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700">Account Holder Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                name="accountHolderName"
                                value={formData.accountHolderName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="Name as per bank records"
                                className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-sm font-medium uppercase"
                                required
                            />
                        </div>
                        <p className="text-[10px] text-gray-400">Must match the name on your Aadhaar/PAN</p>
                    </div>

                    {/* IFSC & Bank Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">IFSC Code</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="ifscCode"
                                    value={formData.ifscCode}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    maxLength={11}
                                    placeholder="SBIN000XXXX"
                                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all uppercase font-mono tracking-wide ${ifscVerified ? "border-green-300 focus:border-green-500 focus:ring-green-100" :
                                            "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                                        }`}
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    {isIfscValidating ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> :
                                        ifscVerified ? <CheckCircle2 className="w-5 h-5 text-green-500" /> :
                                            <Search className="w-5 h-5" />}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Bank Name</label>
                            <div className="relative">
                                <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.bankName}
                                    readOnly
                                    placeholder="Auto-detected"
                                    className={`w-full pl-9 pr-4 py-3 rounded-xl border outline-none text-sm font-medium cursor-not-allowed ${
                                        ifscVerified ? "bg-green-50 text-green-800 border-green-100" : "bg-gray-100 text-gray-500 border-gray-200"
                                    }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Account Numbers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Account Number</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="password"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-sm font-mono tracking-widest"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-gray-700">Confirm Account Number</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    name="confirmAccountNumber"
                                    value={formData.confirmAccountNumber}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    onPaste={handlePastePrevent} // 🚫 BLOCK PASTE
                                    className={`w-full pl-9 pr-4 py-3 rounded-xl border focus:ring-2 outline-none bg-gray-50 text-sm font-mono tracking-widest ${
                                        formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber
                                            ? "border-red-300 focus:ring-red-200"
                                            : "border-gray-200 focus:ring-blue-500"
                                    }`}
                                    required
                                />
                            </div>
                            {formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber && (
                                <p className="text-xs text-red-500 flex items-center gap-1 font-medium animate-pulse mt-1">
                                    <AlertCircle className="w-3 h-3" /> Numbers do not match
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Proof Upload */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700">Upload Passbook / Cheque</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {file ? (
                                <div className="flex items-center justify-center gap-2 text-green-600 font-medium bg-green-50 py-2 px-4 rounded-lg inline-flex">
                                    <Check className="w-5 h-5" />
                                    <span className="truncate max-w-[200px]">{file.name}</span>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); setFile(null); }}
                                        className="p-1 hover:bg-green-100 rounded-full z-10"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-gray-500">
                                    <div className="p-3 bg-gray-100 rounded-full">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs">
                                        <span className="font-bold text-blue-600">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-[10px] text-gray-400">Clear photo of account details</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Security Badge */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex items-center gap-3 text-xs text-blue-800">
                        <ShieldCheck className="w-5 h-5 shrink-0" />
                        <p>Your bank details are encrypted and will only be used for payouts.</p>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex gap-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !ifscVerified || !file || (formData.accountNumber !== formData.confirmAccountNumber)}
                            className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-blue-200"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {isUploading ? "Uploading..." : "Submitting..."}
                                </>
                            ) : (
                                "Submit Request"
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </Modal>
    );
};

export default BankUpdateModal;