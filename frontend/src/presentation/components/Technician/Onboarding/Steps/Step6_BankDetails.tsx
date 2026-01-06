import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  ArrowRight, ArrowLeft, Loader2, Landmark, CheckCircle2, AlertCircle, Search 
} from "lucide-react";
import type { RootState, AppDispatch } from "../../../../../store/store"; // Access Redux State
import { 
  technicianOnboardingRepository, 
  type Step6Data 
} from "../../../../../infrastructure/repositories/technician/technicianOnboardingRepository";
import { 
  updateBankDetails, 
  updateVerificationStatus, 
  setOnboardingStep 
} from "../../../../../store/technicianSlice";
import { useNotification } from "../../../../hooks/useNotification";

interface Step6Props {
  onNext: () => void;
  onBack: () => void;
}

const Step6_BankDetails: React.FC<Step6Props> = ({ onNext, onBack }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.technician); // ✅ Get Profile
  const { showSuccess, showError } = useNotification();

  // ✅ FIX 1: Initialize form with Redux data if available
  const [formData, setFormData] = useState({
    accountHolderName: profile?.bankDetails?.accountHolderName || "",
    accountNumber: profile?.bankDetails?.accountNumber || "",
    confirmAccountNumber: profile?.bankDetails?.accountNumber || "", // Pre-fill confirm too
    ifscCode: profile?.bankDetails?.ifscCode || "",
    bankName: profile?.bankDetails?.bankName || "",
    branchName: "" 
  });

  const [loadingIfsc, setLoadingIfsc] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ✅ FIX 2: If we pre-filled data, consider it verified initially
  const [ifscVerified, setIfscVerified] = useState(!!profile?.bankDetails?.bankName);

  // --- IFSC Auto-Fetch Logic ---
  useEffect(() => {
    const fetchIfsc = async () => {
      const code = formData.ifscCode.toUpperCase();
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

      // Only fetch if it changed from what we already have, OR if we don't have a bank name yet
      if (code.length === 11) {
        if (!ifscRegex.test(code)) {
          showError("Invalid IFSC format.");
          setIfscVerified(false);
          return;
        }

        // Optimization: Don't re-fetch if it matches the pre-filled valid data
        if (profile?.bankDetails?.ifscCode === code && formData.bankName) {
            setIfscVerified(true);
            return;
        }

        try {
          setLoadingIfsc(true);
          const data = await technicianOnboardingRepository.fetchBankDetailsByIfsc(code);
          
          setFormData(prev => ({
            ...prev,
            bankName: data.BANK,
            branchName: data.BRANCH
          }));
          setIfscVerified(true);
          showSuccess("Bank details verified!");
        } catch {
          setIfscVerified(false);
          setFormData(prev => ({ ...prev, bankName: "", branchName: "" }));
          showError("Invalid IFSC Code. Bank not found.");
        } finally {
          setLoadingIfsc(false);
        }
      } else {
        // Reset if user clears input
        if (ifscVerified && code.length < 11) {
            setIfscVerified(false);
            setFormData(prev => ({ ...prev, bankName: "", branchName: "" }));
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (formData.ifscCode) fetchIfsc();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.ifscCode]); 
  // removed other deps to prevent loop, logic handles internal checks

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if ((name === "accountNumber" || name === "confirmAccountNumber") && !/^\d*$/.test(value)) {
      return;
    }

    if (name === "ifscCode" && !/^[A-Za-z0-9]*$/.test(value)) {
      return;
    }

    setFormData(prev => ({ ...prev, [name]: name === "ifscCode" ? value.toUpperCase() : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.accountHolderName.trim()) {
      showError("Account Holder Name is required.");
      return;
    }
    if (!formData.accountNumber) {
      showError("Account Number is required.");
      return;
    }
    if (formData.accountNumber !== formData.confirmAccountNumber) {
      showError("Account Numbers do not match.");
      return;
    }
    if (!ifscVerified || !formData.bankName) {
      showError("Please enter a valid IFSC code.");
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
      
      // ✅ Critical: Only flip to PENDING if we are genuinely done.
      // If we are in "REJECTED" mode, the resubmit button on dashboard handles the status flip.
      // But for first-time flow, we set it here.
      // We can check if status is NOT rejected to set it pending, 
      // OR just rely on the backend to handle the status transition.
      // For now, consistent with your previous flow:
      dispatch(updateVerificationStatus("VERIFICATION_PENDING"));

      showSuccess("Application Saved!");
      onNext(); 
    } catch {
      showError("Failed to save details.");
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
          Please provide your bank details for payouts. Ensure the name matches your ID proof.
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
            placeholder="e.g. Rahul Kumar"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            required
          />
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
              maxLength={11}
              placeholder="e.g. SBIN0001234"
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all uppercase ${
                 ifscVerified ? "border-green-300 focus:border-green-500 focus:ring-green-100" :
                 "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
              }`}
              required
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {loadingIfsc ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : 
               ifscVerified ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : 
               <Search className="w-5 h-5" />}
            </div>
          </div>
          
          {/* Detected Bank Display */}
          {formData.bankName && (
            <div className="flex items-center gap-2 text-xs font-medium text-green-700 bg-green-50 px-3 py-2 rounded-lg mt-2">
              <Landmark className="w-3.5 h-3.5" />
              <span>{formData.bankName} {formData.branchName ? `- ${formData.branchName}` : ""}</span>
            </div>
          )}
        </div>

        {/* Account Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Account Number</label>
            <input
              type="text" // Changed from password to text for easier editing on re-visit
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Enter Account Number"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Confirm Account Number</label>
            <input
              type="text" // Changed from password to text
              name="confirmAccountNumber"
              value={formData.confirmAccountNumber}
              onChange={handleChange}
              placeholder="Re-enter Account Number"
              className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all ${
                 formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber
                   ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                   : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
              }`}
              required
            />
            {formData.confirmAccountNumber && formData.accountNumber !== formData.confirmAccountNumber && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Numbers do not match
              </p>
            )}
          </div>
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
            disabled={isSubmitting || !ifscVerified || !formData.accountNumber}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                Save & Continue <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step6_BankDetails;