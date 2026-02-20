import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  User, Mail, Phone, Save, Loader2, ArrowLeft, 
  Lock, Briefcase, Pencil, Calendar, MapPin
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../../notifications/hooks/useNotification";
import type { AppDispatch, RootState } from "../../../../store/store";
import { updatePersonalDetails } from "../../../../store/technicianSlice";
import { technicianOnboardingRepository } from "../../../onboarding/api/technicianOnboardingRepository";

const EXPERIENCE_OPTIONS = [
  "0-1 Years", "1-3 Years", "3-5 Years", 
  "5-10 Years", "10+ Years"
];

const PersonalDetails: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccess, showError } = useNotification();
  const { profile } = useSelector((state: RootState) => state.technician);

  // --- STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Local Form State
  const [formData, setFormData] = useState({
    bio: profile?.bio || "",
    experienceSummary: profile?.experienceSummary || "",
  });

  // --- ACTIONS ---
  const handleSave = async () => {
    if (!profile?.id) return;
    if (formData.bio.length < 20) {
      showError("Bio must be at least 20 characters.");
      return;
    }

    try {
      setIsSaving(true);
      await technicianOnboardingRepository.updateStep1({
        bio: formData.bio,
        experienceSummary: formData.experienceSummary,
        avatarUrl: profile.avatarUrl 
      });

      dispatch(updatePersonalDetails(formData));
      showSuccess("Profile updated successfully!");
      setIsEditing(false); 
    } catch (err) {
      console.error(err);
      showError("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      bio: profile?.bio || "",
      experienceSummary: profile?.experienceSummary || "",
    });
    setIsEditing(false);
  };

  if (!profile) return null;

  const joinedDate = profile.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : "Recent";

  return (
    <div className="w-full space-y-6 animate-fade-in pb-12">
      
      {/* --- 1. NAVIGATION ROW (Separated) --- */}
      <div>
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors px-1"
        >
          <div className="p-1 rounded-full bg-white border border-gray-200 group-hover:border-gray-300 shadow-sm transition-all">
             <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Profile
        </button>
      </div>

      {/* --- 2. IDENTITY CARD (Clean) --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        
        {/* Left: Avatar & Identity */}
        <div className="flex items-center gap-5">
           <div className="relative shrink-0">
             <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-gray-100 shadow-sm overflow-hidden bg-gray-50">
               {profile.avatarUrl ? (
                 <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <User className="w-full h-full p-4 text-gray-300" />
               )}
             </div>
             {profile.verificationStatus === "VERIFIED" && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 border-2 border-white text-white p-1 rounded-full shadow-sm">
                  <span className="sr-only">Verified</span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
             )}
           </div>
           
           <div>
             <h1 className="text-xl md:text-2xl font-bold text-gray-900">{profile.name}</h1>
             <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-500 mt-1.5">
                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                   <MapPin className="w-3.5 h-3.5 text-gray-400" />
                   {profile.zoneIds?.length || 0} Zones
                </span>
                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                   <Calendar className="w-3.5 h-3.5 text-gray-400" />
                   Joined {joinedDate}
                </span>
             </div>
           </div>
        </div>

        {/* Right: Actions (Cleanly Separated) */}
        <div className="flex items-center gap-3 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0 mt-2 md:mt-0">
           {isEditing ? (
             <>
               <button 
                 onClick={handleCancel}
                 disabled={isSaving}
                 className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-all"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleSave}
                 disabled={isSaving}
                 className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
               >
                 {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                 Save Changes
               </button>
             </>
           ) : (
             <button 
               onClick={() => setIsEditing(true)}
               className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl transition-all active:scale-95"
             >
               <Pencil className="w-4 h-4" />
               Edit Details
             </button>
           )}
        </div>
      </div>

      {/* --- 3. CONTENT GRID --- */}
      <div className="grid md:grid-cols-12 gap-6">
        
        {/* LEFT: LOCKED IDENTITY (Col-4) */}
        <div className="md:col-span-4 space-y-6 order-2 md:order-1">
           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5 border-b border-gray-100 pb-3">
                 Verified Contact
              </h3>
              
              <div className="space-y-5">
                 <div className="group">
                    <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block">Phone Number</label>
                    <div className="flex items-center gap-3 text-sm text-gray-700 font-medium bg-gray-50/50 p-2.5 rounded-lg border border-transparent group-hover:border-gray-100 transition-colors">
                       <Phone className="w-4 h-4 text-gray-400" />
                       {profile.phone}
                       <Lock className="w-3.5 h-3.5 text-gray-300 ml-auto" />
                    </div>
                 </div>

                 <div className="group">
                    <label className="text-[11px] font-semibold text-gray-400 mb-1.5 block">Email Address</label>
                    <div className="flex items-center gap-3 text-sm text-gray-700 font-medium bg-gray-50/50 p-2.5 rounded-lg border border-transparent group-hover:border-gray-100 transition-colors">
                       <Mail className="w-4 h-4 text-gray-400" />
                       <span className="truncate">{profile.email}</span>
                       <Lock className="w-3.5 h-3.5 text-gray-300 ml-auto" />
                    </div>
                 </div>
              </div>

              {isEditing && (
                <div className="mt-6 p-3 bg-blue-50/80 border border-blue-100 rounded-lg flex gap-3 items-start animate-fade-in">
                   <Lock className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                   <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                      Identity details are locked for security.
                   </p>
                </div>
              )}
           </div>
        </div>

        {/* RIGHT: EDITABLE DETAILS (Col-8) */}
        <div className="md:col-span-8 order-1 md:order-2">
           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 h-full">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                 <Briefcase className="w-4 h-4 text-blue-600" /> Professional Bio
              </h3>

              <div className="space-y-8">
                 {/* Experience Section */}
                 <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">Total Experience</label>
                    {isEditing ? (
                       <div className="flex flex-wrap gap-2">
                          {EXPERIENCE_OPTIONS.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setFormData(prev => ({...prev, experienceSummary: opt}))}
                              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                                formData.experienceSummary === opt 
                                  ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-100" 
                                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                       </div>
                    ) : (
                       <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-semibold">
                          <Briefcase className="w-4 h-4 text-gray-500" />
                          {profile.experienceSummary || "Not Specified"}
                       </div>
                    )}
                 </div>

                 {/* Bio Section */}
                 <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">About Me</label>
                    {isEditing ? (
                       <div className="relative">
                          <textarea 
                             value={formData.bio}
                             onChange={(e) => setFormData(prev => ({...prev, bio: e.target.value}))}
                             rows={6}
                             className="w-full p-4 rounded-xl border border-gray-300 focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all resize-none text-sm leading-relaxed"
                             placeholder="Write a short bio about your skills..."
                          />
                          <div className="absolute bottom-3 right-3 text-[10px] text-gray-400 bg-white/80 px-2 py-0.5 rounded">
                             {formData.bio.length} chars
                          </div>
                       </div>
                    ) : (
                       <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 min-h-[120px]">
                          {profile.bio ? (
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                               {profile.bio}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                               No bio added yet.
                            </p>
                          )}
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default PersonalDetails;