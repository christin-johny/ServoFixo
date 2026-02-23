import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Check, Loader2, AlertCircle } from "lucide-react";
import type { RootState, AppDispatch } from "../../../store/store";
import type { TechnicianProfile } from "../../../store/technicianSlice";

// Import Steps
import Step1_Personal from "../components/steps/Step1_Personal";
import Step2_WorkPreferences from "../components/steps/Step2_WorkPreferences";
import Step3_Zones from "../components/steps/Step3_Zones";
import Step4_Rates from "../components/steps/Step4_Rates";
import Step5_Documents from "../components/steps/Step5_Documents";
import Step6_Bank from "../components/steps/Step6_BankDetails";

const STEPS = [
  { number: 1, title: "Personal", shortTitle: "Personal" },
  { number: 2, title: "Work", shortTitle: "Work" },
  { number: 3, title: "Zones", shortTitle: "Zones" },
  { number: 4, title: "Rates", shortTitle: "Rates" },
  { number: 5, title: "Docs", shortTitle: "Docs" },
  { number: 6, title: "Bank", shortTitle: "Bank" },
];

interface ProfileWithRejection {
  globalRejectionReason?: string;
  rejectionReason?: string;
}

// --- COMPACT REJECTION BANNER ---
const RejectionBanner: React.FC<{ profile: TechnicianProfile }> = ({ profile }) => {
  const status = profile.verificationStatus as string;
  if (status !== "REJECTED") return null;
  
  const rejectedDocs = profile.documents?.filter(d => d.status === "REJECTED") || [];
  const hasDocRejection = rejectedDocs.length > 0;
  
  const profileRejection = profile as unknown as ProfileWithRejection;
  const rawGlobalReason = profileRejection?.globalRejectionReason || profileRejection?.rejectionReason;
  const showGlobalReason = rawGlobalReason && rawGlobalReason !== "Invalid Documents";

  return (
    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
      <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
      <div className="text-sm">
        <h3 className="font-bold text-red-900">Application Returned</h3>
        <div className="text-red-700 mt-0.5 space-y-1">
            {showGlobalReason && <p>• {rawGlobalReason}</p>}
            {hasDocRejection && (
                <p>• {rejectedDocs.length} document{rejectedDocs.length > 1 ? 's' : ''} rejected: <span className="font-semibold">{rejectedDocs.map(d => d.type.replace(/_/g, " ")).join(", ")}</span></p>
            )}
        </div>
      </div>
    </div>
  );
};

const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dispatch = useDispatch<AppDispatch>();
  
  const { profile, loading } = useSelector((state: RootState) => state.technician);
  
  // Initialize Step Logic
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (!profile) return 1;
    if (location.state && typeof location.state.step === 'number') return location.state.step;
    
    // Smart Redirect
    if ((profile.verificationStatus as string) === "REJECTED") {
        const hasDocRejection = profile.documents?.some(d => d.status === "REJECTED");
        const profileRejection = profile as unknown as ProfileWithRejection;
        const rawReason = profileRejection.globalRejectionReason || profileRejection.rejectionReason;
        const hasGlobalError = rawReason && rawReason !== "Invalid Documents";
        if (hasDocRejection && !hasGlobalError) return 5;
        return 1;
    }
    return profile.onboardingStep && profile.onboardingStep <= 6 ? profile.onboardingStep : 1;
  });

  // Redirect completed users
  useEffect(() => { 
    if (profile?.onboardingStep && profile.onboardingStep > 6) {
       if ((profile.verificationStatus as string) !== "REJECTED") {
        navigate("/technician");
      }
    }
  }, [profile?.onboardingStep, profile?.verificationStatus, navigate]);

  const handleSaveAndExit = () => { navigate("/technician"); };

  if (loading || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    const commonProps = { onSaveAndExit: handleSaveAndExit };
    switch (currentStep) {
      case 1: return <Step1_Personal onNext={() => setCurrentStep(2)} {...commonProps} />;
      case 2: return <Step2_WorkPreferences onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} {...commonProps} />;
      case 3: return <Step3_Zones onNext={() => setCurrentStep(4)} onBack={() => setCurrentStep(2)} {...commonProps} />;
      case 4: return <Step4_Rates onNext={() => setCurrentStep(5)} onBack={() => setCurrentStep(3)} {...commonProps} />;
      case 5: return <Step5_Documents onNext={() => setCurrentStep(6)} onBack={() => setCurrentStep(4)} {...commonProps} />;
      case 6: return <Step6_Bank onNext={() => setCurrentStep(7)} onBack={() => setCurrentStep(5)} {...commonProps} />;
      default: return <Step1_Personal onNext={() => setCurrentStep(2)} {...commonProps} />;
    }
  };

  const isRejected = (profile.verificationStatus as string) === "REJECTED";

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 pt-6 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-4xl">
        
        {/* HEADER */}
        <div className="mb-6 px-4 sm:px-0">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            {isRejected ? "Update Application" : "Partner Onboarding"}
          </h1>
        </div>

        {/* ALERT BANNER */}
        <div className="px-4 sm:px-0">
            <RejectionBanner profile={profile} />
        </div>

        {/* DESKTOP STEPPER */}
        <div className="hidden md:block mb-8 px-2">
            <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-4 h-0.5 w-full bg-gray-200 -z-10">
                    <div className="h-full bg-blue-600 transition-all duration-500 ease-in-out" style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }} />
                </div>
                {STEPS.map((step) => {
                    const isCompleted = step.number < currentStep;
                    const isCurrent = step.number === currentStep;
                    const isDocError = isRejected && step.number === 5 && profile.documents?.some(d => d.status === "REJECTED");
                    return (
                        <button 
                            key={step.number} 
                            onClick={() => setCurrentStep(step.number)}
                            disabled={!isCompleted && !isCurrent && !isRejected} 
                            className="group flex flex-col items-center focus:outline-none disabled:cursor-not-allowed"
                        >
                            <div className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                    isDocError ? "border-red-500 bg-red-50 text-red-600 ring-2 ring-red-100" : 
                                    isCompleted ? "border-blue-600 bg-blue-600 text-white" : 
                                    isCurrent ? "border-blue-600 bg-white text-blue-600 ring-2 ring-blue-50 scale-110" : 
                                    "border-gray-300 bg-white text-gray-400"
                                }`}>
                                {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : <span className="text-xs font-bold">{step.number}</span>}
                            </div>
                            <span className={`mt-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                isCurrent ? "text-blue-700" : isDocError ? "text-red-600" : "text-gray-500"
                            }`}>
                                {step.shortTitle}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* MOBILE STEPPER */}
        <div className="md:hidden sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm pb-3 pt-2 px-4 border-b border-gray-200 mb-6 -mx-4 sm:mx-0">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Step {currentStep}/{STEPS.length}</span>
                <span className="text-xs font-bold text-gray-900">{STEPS[currentStep - 1]?.title}</span>
            </div>
            <div className="flex gap-1 h-1 w-full">
                {STEPS.map((step) => (
                    <div key={step.number} className={`h-full flex-1 rounded-full ${step.number <= currentStep ? "bg-blue-600" : "bg-gray-200"}`} />
                ))}
            </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="bg-white shadow-sm sm:rounded-xl border border-gray-200 overflow-hidden">
             <div className="p-5 md:p-8">{renderStepContent()}</div>
        </div>

      </div>
    </div>
  );
};

export default OnboardingWizard;