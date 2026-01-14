import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Camera, Upload, Loader2, ArrowRight, Save, User, Mail, Phone, AlertCircle, Check } from "lucide-react";

import type { AppDispatch, RootState } from "../../../../../store/store";
import { technicianOnboardingRepository } from "../../../../../infrastructure/repositories/technician/technicianOnboardingRepository";
import { updatePersonalDetails, setOnboardingStep } from "../../../../../store/technicianSlice";
import { useNotification } from "../../../../hooks/useNotification";
import ImageCropperModal from "../../../../components/Shared/ImageCropper/ImageCropperModal";

// IMPORT CONFIG
import { 
  step1Schema, 
  EXPERIENCE_OPTIONS, 
  type Step1FormData, 
  INITIAL_STEP1_STATE 
} from "./step1.config";

interface Step1Props {
  onNext: () => void;
  onSaveAndExit: () => void;
}

const Step1_Personal: React.FC<Step1Props> = ({ onNext, onSaveAndExit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.technician);
  const { showSuccess, showError } = useNotification();
    
  // --- STATE ---
  const [formData, setFormData] = useState<Partial<Step1FormData>>(() => ({
    ...INITIAL_STEP1_STATE,
    // ✅ CHANGED: Read directly from flattened profile
    ...(profile ? {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
        bio: profile.bio,
        experienceSummary: profile.experienceSummary
    } : {})
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Cropper State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Computed Values
  const isRejected = profile?.verificationStatus === "REJECTED";
  // ✅ CHANGED: Direct access
  const email = profile?.email || "";
  const phone = profile?.phone || "";
 
  // ✅ CHANGED: Sync Effect reads from flattened profile
  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: profile.name || prev.name,
        avatarUrl: profile.avatarUrl || prev.avatarUrl,
        bio: profile.bio || prev.bio,
        experienceSummary: profile.experienceSummary || prev.experienceSummary
      }));
    }
  }, [profile]);
 
  const handleChange = (field: keyof Step1FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: keyof Step1FormData) => {
    const value = formData[field];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed !== value) {
        handleChange(field, trimmed);
      }
    }
  };
 
  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        showError("Only image files are allowed");
        return;
      }
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        if (typeof reader.result === "string") {
          setImageSrc(reader.result);
          setIsCropping(true);
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      });
      reader.readAsDataURL(file);
    }
  };

  const handleUploadCroppedImage = async (blob: Blob) => {
    try {
      setIsUploading(true);
      const file = new File([blob], "profile_avatar.jpg", { type: "image/jpeg" });

      if (file.size > 5 * 1024 * 1024) {
         showError("Image is too large. Please zoom out or pick another.");
         return;
      }

      const response = await technicianOnboardingRepository.uploadAvatar(file);
      handleChange("avatarUrl", response.url);
      
      showSuccess("Avatar updated successfully");
      setIsCropping(false);
      setImageSrc(null);
    } catch (e) {
      console.error(e);
      showError("Failed to process image");
    } finally {
      setIsUploading(false);
    }
  };

  const validateAndSave = async (): Promise<boolean> => {
    const result = step1Schema.safeParse(formData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(newErrors);
      showError("Please fix the errors in the form.");
      return false;
    }

    try {
      setIsSaving(true);
      const validData = result.data;
        
      await technicianOnboardingRepository.updateStep1(validData);
        
      dispatch(updatePersonalDetails(validData));
      
      if (!isRejected) {
        dispatch(setOnboardingStep(2));
      }
      return true;
    } catch (err) {
      console.error(err);
      showError("Failed to save details.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid md:grid-cols-12 gap-8">
        
        {/* LEFT: Avatar & Info */}
        <div className="md:col-span-4 flex flex-col items-center space-y-6">
            <div className="flex flex-col items-center gap-2">
                <div className={`relative group w-40 h-40 rounded-full border-4 shadow-xl overflow-hidden bg-gray-50 flex items-center justify-center ring-4 
                    ${errors.avatarUrl ? "border-red-500 ring-red-100" : "border-white ring-gray-100"}`}>
                    
                    {formData.avatarUrl ? (
                        <img src={formData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <Camera className={`w-12 h-12 ${errors.avatarUrl ? "text-red-300" : "text-gray-300"}`} />
                    )}
                </div>
                {errors.avatarUrl && (
                    <span className="text-xs text-red-500 font-bold animate-pulse">{errors.avatarUrl}</span>
                )}
                
                <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-[-20px] z-10 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-lg border-4 border-white active:scale-90"
                    aria-label="Upload Photo"
                >
                    <Upload className="w-5 h-5" />
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={onFileSelect}
                />
            </div>
            
            <div className="w-full bg-gray-50 rounded-xl p-5 border border-gray-200 space-y-4">
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                    <div className="relative mt-1">
                        <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            value={formData.name} 
                            onChange={(e) => handleChange("name", e.target.value)}
                            onBlur={() => handleBlur("name")}
                            className={`w-full pl-9 pr-3 py-2 bg-white border rounded-lg text-sm font-semibold text-gray-800 focus:ring-2 focus:outline-none transition-all
                                ${errors.name ? "border-red-300 focus:ring-red-200" : "border-gray-300 focus:ring-blue-500"}`}
                            placeholder="Your Name"
                        />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                 </div>
                 
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</label>
                    <div className="flex items-center gap-3 mt-1 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200 text-gray-500">
                        <Mail className="w-4 h-4 shrink-0" /> <span className="text-sm truncate">{email}</span>
                    </div>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</label>
                    <div className="flex items-center gap-3 mt-1 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200 text-gray-500">
                        <Phone className="w-4 h-4 shrink-0" /> <span className="text-sm">{phone}</span>
                    </div>
                 </div>
            </div>
        </div>

        {/* RIGHT: Form Fields */}
        <div className="md:col-span-8 space-y-6">
            <div className={`bg-white rounded-xl p-1 ${errors.experienceSummary ? "ring-2 ring-red-100" : ""}`}>
                <label className="block text-sm font-bold text-gray-700 mb-3 px-1">
                  Experience <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {EXPERIENCE_OPTIONS.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => handleChange("experienceSummary", option)}
                        className={`px-3 py-3 rounded-xl text-sm font-medium border transition-all ${
                        formData.experienceSummary === option
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                    >
                        {option}
                    </button>
                    ))}
                </div>
                {errors.experienceSummary && <p className="mt-2 text-xs text-red-500 px-1">{errors.experienceSummary}</p>}
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Bio <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <textarea
                        value={formData.bio}
                        onChange={(e) => handleChange("bio", e.target.value)}
                        onBlur={() => handleBlur("bio")}
                        rows={6}
                        className={`w-full px-4 py-3 rounded-xl border focus:ring-2 transition-all resize-none shadow-sm ${
                            errors.bio ? "border-red-300 bg-red-50/10" : "border-gray-300 focus:ring-blue-500"
                        }`}
                        placeholder="Describe your skills..."
                    />
                    <div className="absolute bottom-3 right-3 text-xs font-medium text-gray-400 bg-white/80 px-2 py-0.5 rounded-md">
                        {formData.bio?.length || 0} chars
                    </div>
                </div>
                {errors.bio ? (
                    <p className="mt-2 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.bio}</p>
                ) : (
                    <p className="mt-2 text-xs text-gray-500">
                          {(formData.bio?.length || 0) < 20 ? (
                           <span className="text-orange-500">Min 20 characters</span>
                          ) : (
                           <span className="text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> Looks good!</span>
                          )}
                    </p>
                )}
            </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100 mt-8">
        {!isRejected && (
            <button
                type="button"
                onClick={async () => { 
                  const saved = await validateAndSave();
                  if (saved) { 
                    showSuccess("Progress saved."); 
                    onSaveAndExit(); 
                  }
                }}
                disabled={isSaving || isUploading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 disabled:opacity-50"
            >
                <Save className="w-5 h-5" /> Save & Exit
            </button>
        )}
        <button
          type="button"
          onClick={async () => { 
            const saved = await validateAndSave();
            if (saved) { 
              showSuccess("Saved!"); 
              onNext(); 
            }
          }}
          disabled={isSaving || isUploading}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-600/20"
        >
          {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <>Next Step <ArrowRight className="w-5 h-5" /></>}
        </button>
      </div>

      {/* Cropper Modal */}
      {isCropping && imageSrc && (
         <ImageCropperModal 
            imageSrc={imageSrc} 
            onClose={() => { setIsCropping(false); setImageSrc(null); }}
            onCropConfirm={handleUploadCroppedImage}
            isUploading={isUploading}
            aspect={1}
            circular={true}
            title="Adjust Profile Picture"
         />
      )}
    </div>
  );
};

export default Step1_Personal;