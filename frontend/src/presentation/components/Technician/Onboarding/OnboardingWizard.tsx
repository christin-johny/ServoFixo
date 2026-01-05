import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { RootState, AppDispatch } from "../../../../store/store";

// Import Steps
import Step1_Personal from "./Steps/Step1_Personal";
import Step2_WorkPreferences from "./Steps/Step2_WorkPreferences";
import Step3_Zones from "./Steps/Step3_Zones";
import Step4_Rates from "./Steps/Step4_Rates";
import Step5_Documents from "./Steps/Step5_Documents";
// import Step6_Bank from "./Steps/Step6_Bank";

const STEPS = [
  { number: 1, title: "Personal Details" },
  { number: 2, title: "Work Preferences" },
  { number: 3, title: "Service Zones" },
  { number: 4, title: "Rates & Agreement" },
  { number: 5, title: "Documents" },
  { number: 6, title: "Bank Details" },
];

const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading } = useSelector((state: RootState) => state.technician);
  
  // ✅ FIX: Lazy Initialization
  // This function runs ONLY once when the component mounts.
  // It grabs the correct step from Redux immediately, so we don't need a useEffect to "sync" it.
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (profile?.onboardingStep) {
      // If step is valid (1-6), use it. If completed (7), default to 1 (handled by redirect below)
      return profile.onboardingStep <= 6 ? profile.onboardingStep : 1;
    }
    return 1;
  });

  // ✅ FIX: Effect is now ONLY for Redirects
  // No setState calls here, so the lint error is gone.
  useEffect(() => {
    if (profile?.onboardingStep && profile.onboardingStep > 6) {
      navigate("/technician");
    }
  }, [profile?.onboardingStep, navigate]);

  // Loading Guard
  if (loading || !profile) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Render the specific step component
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <Step1_Personal onNext={() => setCurrentStep(2)} />;
      case 2: return <Step2_WorkPreferences onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />;
      case 3: return <Step3_Zones onNext={() => setCurrentStep(4)} onBack={() => setCurrentStep(2)} />;
      case 4: return <Step4_Rates onNext={() => setCurrentStep(5)} onBack={() => setCurrentStep(3)} />;
      case 5: return <Step5_Documents onNext={() => setCurrentStep(6)} onBack={() => setCurrentStep(4)} />;
      // case 6: return <Step6_Bank onNext={() => setCurrentStep(7)} onBack={() => setCurrentStep(5)} />;
      default: return <Step1_Personal onNext={() => setCurrentStep(2)} />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
        <p className="text-gray-500 mt-1">
          Step {currentStep} of 6: {STEPS[currentStep - 1]?.title}
        </p>
      </div>

      {/* Progress Stepper (Horizontal) */}
      <div className="mb-10 hidden md:flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full" />
        
        {/* Active Line Fill */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <div key={step.number} className="flex flex-col items-center gap-2 bg-slate-50 px-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted 
                    ? "bg-blue-600 border-blue-600 text-white" 
                    : isCurrent 
                      ? "bg-white border-blue-600 text-blue-600 shadow-md scale-110" 
                      : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-bold">{step.number}</span>}
              </div>
              <span className={`text-xs font-semibold ${isCurrent ? "text-blue-700" : "text-gray-500"}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Step Indicator */}
      <div className="md:hidden mb-6 flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
          {currentStep}
        </div>
        <div>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Current Step</p>
          <p className="text-sm font-bold text-gray-900">{STEPS[currentStep - 1]?.title}</p>
        </div>
      </div>

      {/* Step Content Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 animate-fade-in-up">
        {renderStepContent()}
      </div>
    </div>
  );
};

export default OnboardingWizard;