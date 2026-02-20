import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  ArrowRight, ArrowLeft, Loader2, Calculator, 
  CheckCircle2, AlertCircle, Save 
} from "lucide-react";
import type { AppDispatch, RootState } from "../../../../store/store";
import { 
  technicianOnboardingRepository, 
  type RateCardItem 
} from "../../api/technicianOnboardingRepository";
import { updateRateAgreement, setOnboardingStep } from "../../../../store/technicianSlice";
import { useNotification } from "../../../notifications/hooks/useNotification";

interface Step4Props {
  onNext: () => void;
  onBack: () => void;
  onSaveAndExit: () => void; //   Added for consistency
}

const Step4_Rates: React.FC<Step4Props> = ({ onNext, onBack, onSaveAndExit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.technician);
  const { showSuccess, showError } = useNotification();

  // --- STATE ---
  const [rateCard, setRateCard] = useState<RateCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  // Check Resubmission Status
  const isRejected = profile?.verificationStatus === "REJECTED";

  // --- FETCH RATES ---
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const data = await technicianOnboardingRepository.getRateCard();
        setRateCard(data);
        
        // Auto-check if already agreed previously
        if (profile?.onboardingStep && profile.onboardingStep > 4) {
             setIsAgreed(true);
        }
      } catch (err) {
        console.error(err);
        showError("Failed to fetch rate card details.");
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, [profile]); // Added profile dep to ensure we catch updates

  // --- HANDLERS ---
  const submitAgreement = async () => {
    try {
      setIsSaving(true);
      // We send 'true' to confirm agreement
      await technicianOnboardingRepository.updateStep4({ agreedToRates: true });
      dispatch(updateRateAgreement({ isAgreed: true }));
      return true;
    } catch {
      showError("Failed to save agreement.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (!isAgreed) {
      showError("Please agree to the rate card to proceed.");
      return;
    }

    if (await submitAgreement()) {
      if (!isRejected) dispatch(setOnboardingStep(5)); 
      showSuccess("Rate agreement accepted!");
      onNext();
    }
  };

  const handleSaveExit = async () => {
    // Ideally we only save if they checked the box, otherwise just exit?
    // For now, we enforce agreement to save progress on this specific step.
    if (!isAgreed) {
        showError("Please accept the rates before saving.");
        return;
    }
    if (await submitAgreement()) {
        showSuccess("Progress saved.");
        onSaveAndExit();
    }
  };

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isActionDisabled = isSaving;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600" /> Estimated Earnings
        </h3>
        <p className="text-sm text-gray-500">
          Review the estimated earnings for your selected services. 
          This is the amount you will receive directly in your wallet.
        </p>
      </div>

      {/* Rates Table */}
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Service Name</th>
                <th className="px-6 py-4 text-right text-green-700">Your Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rateCard.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-6 h-6 opacity-50" />
                      <span>No services selected. Please go back to Step 2.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                rateCard.map((item) => (
                  <tr key={item.serviceId} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-green-700 text-base">
                      ₹{item.technicianShare}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {rateCard.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
            <p className="text-[10px] text-gray-500 text-right italic leading-relaxed">
              * Actual earnings may vary slightly due to tax or rounding. 
              Full amount determined at the time of booking.
            </p>
          </div>
        )}
      </div>

      {/* Agreement Checkbox */}
      <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl cursor-pointer hover:bg-blue-100/50 transition-colors" onClick={() => setIsAgreed(!isAgreed)}>
        <label className="flex items-start gap-3 cursor-pointer group pointer-events-none">
          <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 ${
             isAgreed 
               ? "bg-blue-600 border-blue-600" 
               : "bg-white border-blue-300 group-hover:border-blue-500"
          }`}>
            {isAgreed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          </div>
          <input 
            type="checkbox" 
            className="hidden" 
            checked={isAgreed} 
            readOnly
          />
          <div className="space-y-1">
            <span className="text-sm font-bold text-gray-900 select-none">
              I accept the Earnings Structure
            </span>
            <p className="text-xs text-blue-700 leading-relaxed select-none">
              I acknowledge that these earnings are estimates and subject to platform policies.
            </p>
          </div>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-6 border-t border-gray-100">
        <button
          onClick={onBack}
          disabled={isActionDisabled}
          className="flex items-center justify-center gap-2 px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
             {/* Hide Save & Exit if Rejected */}
            {!isRejected && (
                <button
                    onClick={handleSaveExit}
                    disabled={isActionDisabled || !isAgreed}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-50"
                >
                    <Save className="w-5 h-5" /> Save & Exit
                </button>
            )}

            <button
            onClick={handleNext}
            disabled={isActionDisabled || !isAgreed || rateCard.length === 0}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
            >
            {isSaving ? (
                <>
                <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </>
            ) : (
                <>
                Accept & Continue <ArrowRight className="w-5 h-5" />
                </>
            )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Step4_Rates;