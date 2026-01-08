import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Check, 
  Loader2, 
  AlertTriangle 
} from "lucide-react";
import type { RootState, AppDispatch } from "../../../../store/store";
import type { TechnicianProfile } from "../../../../store/technicianSlice";

// Import Steps
import Step1_Personal from "./Steps/Step1_Personal";
import Step2_WorkPreferences from "./Steps/Step2_WorkPreferences";
import Step3_Zones from "./Steps/Step3_Zones";
import Step4_Rates from "./Steps/Step4_Rates";
import Step5_Documents from "./Steps/Step5_Documents";
import Step6_Bank from "./Steps/Step6_BankDetails";

const STEPS = [
  { number: 1, title: "Personal Info", shortTitle: "Personal" },
  { number: 2, title: "Work Profile", shortTitle: "Work" },
  { number: 3, title: "Service Zones", shortTitle: "Zones" },
  { number: 4, title: "Rates", shortTitle: "Rates" },
  { number: 5, title: "Documents", shortTitle: "Docs" },
  { number: 6, title: "Bank Details", shortTitle: "Bank" },
];

// --- Components ---

const RejectionBanner: React.FC<{ profile: TechnicianProfile }> = ({ profile }) => {
  const status = profile.verificationStatus as string;
  if (status !== "REJECTED") return null;
  
  const rejectedDocs = profile.documents?.filter(d => d.status === "REJECTED") || [];
  
  return (
    <div className="mb-8 rounded-lg border-l-4 border-red-600 bg-white p-4 shadow-sm ring-1 ring-gray-900/5 sm:p-6 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Action Required: Application Returned
          </h3>
          <div className="mt-2 text-sm text-gray-600">
            {rejectedDocs.length > 0 ? (
              <p>
                We found issues with <strong>{rejectedDocs.length} document(s)</strong>. 
                Please navigate to the <button className="text-red-700 font-bold hover:underline">Documents</button> step to upload corrected files.
              </p>
            ) : (
              <p>{profile.globalRejectionReason || "Please review your profile details and resubmit."}</p>
            )}
          </div>
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
    
    // Smart Redirect for Rejections
    if ((profile.verificationStatus as string) === "REJECTED") {
        const hasDocRejection = profile.documents?.some(d => d.status === "REJECTED");
        return hasDocRejection ? 5 : 1; 
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

  // ✅ HANDLER: This function is passed to steps to handle "Save & Exit"
  const handleSaveAndExit = () => {
    // Navigate to Dashboard (or Login if you prefer)
    navigate("/technician");
  };

  if (loading || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-gray-500 animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  // ✅ PROPS PASSED: We now pass `onSaveAndExit` to every step
  const renderStepContent = () => {
    const commonProps = {
      onSaveAndExit: handleSaveAndExit
    };

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
      <div className="mx-auto max-w-5xl">
        
        {/* --- HEADER SECTION --- */}
        <div className="mb-8 px-4 sm:px-0">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {isRejected ? "Update Application" : "Partner Onboarding"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Complete the steps below to verify your account and start accepting jobs.
          </p>
        </div>

        {/* --- ALERT BANNER --- */}
        <div className="px-4 sm:px-0">
            <RejectionBanner profile={profile} />
        </div>

        {/* --- DESKTOP STEPPER (Hidden on Mobile) --- */}
        <div className="hidden md:block mb-10 px-2">
            <div className="relative flex items-center justify-between">
                {/* Connecting Line */}
                <div className="absolute left-0 top-5 h-0.5 w-full bg-gray-200 -z-10">
                    <div 
                        className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
                        style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                    />
                </div>

                {STEPS.map((step) => {
                    const isCompleted = step.number < currentStep;
                    const isCurrent = step.number === currentStep;
                    // Highlight step 5 if documents were rejected
                    const isDocError = isRejected && step.number === 5 && profile.documents?.some(d => d.status === "REJECTED");

                    return (
                        <button 
                            key={step.number} 
                            onClick={() => setCurrentStep(step.number)}
                            disabled={!isCompleted && !isCurrent && !isRejected} 
                            className="group flex flex-col items-center focus:outline-none disabled:cursor-not-allowed"
                        >
                            <div 
                                className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                    isDocError 
                                        ? "border-red-500 bg-red-50 text-red-600 ring-4 ring-red-100" 
                                        : isCompleted 
                                            ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                            : isCurrent 
                                                ? "border-blue-600 bg-white text-blue-600 ring-4 ring-blue-50 scale-110 shadow-md"
                                                : "border-gray-300 bg-white text-gray-400 group-hover:border-gray-400"
                                }`}
                            >
                                {isCompleted ? (
                                    <Check className="h-5 w-5" strokeWidth={3} />
                                ) : (
                                    <span className="text-sm font-bold">{step.number}</span>
                                )}
                            </div>
                            <span className={`mt-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                                isCurrent ? "text-blue-700" : isDocError ? "text-red-600" : "text-gray-500"
                            }`}>
                                {step.title}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* --- MOBILE COMPACT STEPPER (Visible on Mobile) --- */}
        <div className="md:hidden sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm pb-4 pt-2 px-4 border-b border-gray-200 mb-6 -mx-4 sm:mx-0">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Step {currentStep} of {STEPS.length}
                </span>
                <span className="text-sm font-bold text-gray-900">
                    {STEPS[currentStep - 1]?.title}
                </span>
            </div>
            {/* Segmented Progress Bar */}
            <div className="flex gap-1 h-1.5 w-full">
                {STEPS.map((step) => {
                    const isCompleted = step.number < currentStep;
                    const isCurrent = step.number === currentStep;
                    return (
                        <div 
                            key={step.number}
                            className={`h-full flex-1 rounded-full transition-all duration-300 ${
                                isCompleted ? "bg-blue-600" : isCurrent ? "bg-blue-400" : "bg-gray-200"
                            }`}
                        />
                    );
                })}
            </div>
        </div>

        {/* --- MAIN CONTENT CARD --- */}
        <div className="bg-white shadow-xl shadow-gray-200/50 sm:rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300">
             <div className="p-6 md:p-10">
                {renderStepContent()}
             </div>
        </div>

      </div>
    </div>
  );
};

export default OnboardingWizard;