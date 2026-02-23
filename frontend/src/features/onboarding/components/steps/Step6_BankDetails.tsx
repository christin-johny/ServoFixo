import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  ArrowRight, ArrowLeft, Loader2, Landmark, CheckCircle2, AlertCircle, Search, ShieldCheck 
} from "lucide-react";
import type { RootState, AppDispatch } from "../../../../store/store";  
import { 
  technicianOnboardingRepository, 
  type Step6Data 
} from "../../api/technicianOnboardingRepository";
import { 
  updateBankDetails, 
  updateVerificationStatus, 
  setOnboardingStep 
} from "../../../../store/technicianSlice";
import { useNotification } from "../../../notifications/hooks/useNotification";

// Local Config
import { step6Schema, type BankDetailsFormData } from "./step6.config";

interface Step6Props {
  onNext: () => void;
  onBack: () => void;
}

const Step6_BankDetails: React.FC<Step6Props> = ({ onNext, onBack }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.technician);  
  const { showSuccess, showError } = useNotification();
 
  const [formData, setFormData] = useState<BankDetailsFormData>({
    accountHolderName: profile?.bankDetails?.accountHolderName || "",
    accountNumber: profile?.bankDetails?.accountNumber || "",
    confirmAccountNumber: profile?.bankDetails?.accountNumber || "",  
    ifscCode: profile?.bankDetails?.ifscCode || "",
    bankName: profile?.bankDetails?.bankName || "",
    branchName: "" 
  });

  const [loadingIfsc, setLoadingIfsc] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ifscVerified, setIfscVerified] = useState(!!profile?.bankDetails?.bankName);
  
  // --- IFSC AUTO-DETECTION ---
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
 
        // Optimization: Don't re-fetch if 
        if (profile?.bankDetails?.ifscCode === code && formData.bankName) {
            setIfscVerified(true);
            return;
        }

        try {
          setLoadingIfsc(true);
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
          setLoadingIfsc(false);
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
    }, 600); // Slight delay to debounce typing

    return () => clearTimeout(timeoutId);
  }, [formData.ifscCode]);   

  // --- HANDLERS ---

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Strict Input Constraints (prevent typing/pasting invalid chars)
    if ((name === "accountNumber" || name === "confirmAccountNumber")) {
        if (!/^\d*$/.test(value)) return;
    }

    if (name === "ifscCode") {
        if (!/^[A-Za-z0-9]*$/.test(value)) return;
    }

    if (name === "accountHolderName") {
        if (!/^[a-zA-Z\s.]*$/.test(value)) return;
    }

    setFormData(prev => ({ ...prev, [name]: name === "ifscCode" ? value.toUpperCase() : value }));
  };

  //   NEW: Auto Trim on Blur
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.trim() }));
  };

  //   ANTI-PASTE PROTECTION
  const handlePastePrevent = (e: React.ClipboardEvent) => {
    e.preventDefault();
    showError("For security, please type the account number manually.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Zod Validation
    const validation = step6Schema.safeParse(formData);
    if (!validation.success) {
        showError(validation.error.errors[0].message);
        return;
    }

    try {
      setIsSubmitting(true);
      
      const payload: Step6Data = {
        bankDetails: {
          accountHolderName: formData.accountHolderName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          bankName: formData.bankName
        }
      };

      await technicianOnboardingRepository.updateStep6(payload);

      dispatch(updateBankDetails(payload.bankDetails));
      dispatch(setOnboardingStep(7)); 
      
      //   FIX: Correct payload structure for Verification Status
      dispatch(updateVerificationStatus({ status: "VERIFICATION_PENDING" }));

      showSuccess("Application Submitted Successfully!");
      onNext(); 
    } catch {
      showError("Failed to save details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Landmark className="w-5 h-5 text-blue-600" /> Bank Account Details
        </h3>
        <p className="text-sm text-gray-500">
          Ensure these details are 100% accurate. This is where your payouts will be sent.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Account Holder Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Account Holder Name</label>
          <input
            type="text"
            name="accountHolderName"
            value={formData.accountHolderName}
            onChange={handleChange}
            onBlur={handleBlur} //   Auto Trim
            placeholder="As per Bank Passbook"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all uppercase"
            autoComplete="off"
          />
          <p className="text-[10px] text-gray-400">Must match the name on your Aadhaar/PAN</p>
        </div>

        {/* IFSC Code */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">IFSC Code</label>
          <div className="relative">
            <input
              type="text"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              onBlur={handleBlur} //   Auto Trim
              maxLength={11}
              placeholder="e.g. SBIN0001234"
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all uppercase font-mono tracking-wide ${
                 ifscVerified ? "border-green-300 focus:border-green-500 focus:ring-green-100" :
                 "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {loadingIfsc ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : 
               ifscVerified ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : 
               <Search className="w-5 h-5" />}
            </div>
          </div>
          
          {/* Detected Bank Display */}
          {formData.bankName ? (
            <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-2 rounded-lg mt-2 border border-green-100 animate-fade-in">
              <Landmark className="w-4 h-4" />
              <span>{formData.bankName}</span>
              {formData.branchName && <span className="font-normal text-green-600">({formData.branchName})</span>}
            </div>
          ) : (
             <div className="h-9"></div> // Placeholder to prevent jump
          )}
        </div>

        {/* Account Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Account Number</label>
            <div className="relative">
                <input
                type="password" // Initially hide for security
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                onBlur={handleBlur} //   Auto Trim
                placeholder="Enter Account Number"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all tracking-widest"
                autoComplete="off"
                inputMode="numeric"
                />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Confirm Account Number</label>
            <div className="relative group">
                <input
                type="text"  
                name="confirmAccountNumber"
                value={formData.confirmAccountNumber}
                onChange={handleChange}
                onBlur={handleBlur} //   Auto Trim
                onPaste={handlePastePrevent} // 🚫 BLOCK PASTE
                placeholder="Re-enter to Confirm"
                className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all tracking-widest ${
                    formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/10"
                    : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                }`}
                autoComplete="off"
                inputMode="numeric"
                />
                
                {/* Match Indicator */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {formData.confirmAccountNumber && (
                        formData.accountNumber === formData.confirmAccountNumber ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-500" />
                        )
                    )}
                </div>
            </div>
            {formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber && (
              <p className="text-xs text-red-500 flex items-center gap-1 font-medium animate-pulse">
                Numbers do not match
              </p>
            )}
          </div>
        </div>

        {/* Security Badge */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex items-center gap-3 text-xs text-blue-800">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <p>Your bank details are encrypted and will only be used for payouts. We will never ask for your OTP or PIN.</p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !ifscVerified || !formData.accountNumber || (formData.accountNumber !== formData.confirmAccountNumber)}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                Complete & Submit <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step6_BankDetails;