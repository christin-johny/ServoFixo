import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Camera, Upload, Loader2, ArrowRight } from "lucide-react";
import type { AppDispatch, RootState } from "../../../../../store/store";
import { technicianOnboardingRepository } from "../../../../../infrastructure/repositories/technician/technicianOnboardingRepository";
import { updatePersonalDetails, setOnboardingStep } from "../../../../../store/technicianSlice";
import { useNotification } from "../../../../hooks/useNotification";

interface Step1Props {
  onNext: () => void;
}

const EXPERIENCE_OPTIONS = [
  "Fresher (0-1 Years)",
  "1-3 Years",
  "3-5 Years",
  "5-10 Years",
  "10+ Years Expert"
];

const Step1_Personal: React.FC<Step1Props> = ({ onNext }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.technician);
  const { showSuccess, showError } = useNotification();
  
  // Local State initialized with Redux data (Resume Logic)
  const [bio, setBio] = useState(profile?.bio || "");
  const [experience, setExperience] = useState(profile?.experienceSummary || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || "");
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Avatar File Selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB) & Type
    if (file.size > 5 * 1024 * 1024) {
      showError("Image size must be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      showError("Only image files are allowed");
      return;
    }

    try {
      setIsUploading(true);
      // Call our repository helper
      const response = await technicianOnboardingRepository.uploadAvatar(file);
      setAvatarUrl(response.url); // Show preview immediately
      showSuccess("Avatar uploaded successfully");
    } catch {
      showError("Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = async () => {
    // Validation
    if (!bio.trim() || bio.length < 20) {
      showError("Please provide a bio of at least 20 characters.");
      return;
    }
    if (!experience) {
      showError("Please select your years of experience.");
      return;
    }

    try {
      setIsSaving(true);
      
      // 1. Send to Backend
      const payload = { bio, experienceSummary: experience, avatarUrl };
      await technicianOnboardingRepository.updateStep1(payload);

      // 2. Update Redux (Optimistic update)
      dispatch(updatePersonalDetails(payload));
      dispatch(setOnboardingStep(2));

      showSuccess("Personal details saved!");
      onNext(); // Trigger Wizard transition
    } catch{
      showError("Failed to save details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Avatar Section */}
      <div className="flex flex-col items-center justify-center">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            ) : avatarUrl ? (
              <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-10 h-10 text-gray-400" />
            )}
          </div>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md border-2 border-white"
            title="Upload Photo"
          >
            <Upload className="w-4 h-4" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <p className="mt-3 text-sm text-gray-500 font-medium">Upload a professional photo</p>
      </div>

      <div className="grid md:grid-cols-1 gap-6 max-w-2xl mx-auto">
        {/* 2. Experience Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Years of Experience <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {EXPERIENCE_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => setExperience(option)}
                className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                  experience === option
                    ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-100"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Bio Input */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Professional Bio <span className="text-red-500">*</span>
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            placeholder="Describe your skills, work ethic, and what makes you a great technician..."
          />
          <div className="flex justify-between mt-1">
             <span className="text-xs text-gray-400">Min 20 characters</span>
             <span className={`text-xs ${bio.length >= 20 ? "text-green-600" : "text-gray-400"}`}>
               {bio.length} chars
             </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end pt-6 border-t border-gray-100">
        <button
          onClick={handleNext}
          disabled={isSaving || isUploading}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Saving...
            </>
          ) : (
            <>
              Next Step <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Step1_Personal;