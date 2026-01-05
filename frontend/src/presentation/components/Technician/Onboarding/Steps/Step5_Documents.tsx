import React, { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { 
  ArrowRight, ArrowLeft, Loader2, UploadCloud, FileText, CheckCircle2, AlertCircle, Plus, Trash2
} from "lucide-react";
import type { AppDispatch } from "../../../../../store/store";
import { 
  technicianOnboardingRepository, 
  type DocumentMeta 
} from "../../../../../infrastructure/repositories/technician/technicianOnboardingRepository";
import { updateDocuments, setOnboardingStep } from "../../../../../store/technicianSlice";
import { useNotification } from "../../../../hooks/useNotification";

interface Step5Props {
  onNext: () => void;
  onBack: () => void;
}

interface DraftDocument {
  id: string;
  type: "AADHAAR" | "PAN" | "CERTIFICATE" | "OTHER";
  customName?: string; // Editable for OTHER types
  file?: File;
  serverUrl?: string; 
  status: "IDLE" | "UPLOADING" | "SUCCESS" | "ERROR";
  errorMessage?: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];

const Step5_Documents: React.FC<Step5Props> = ({ onNext, onBack }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showSuccess, showError } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [isConsented, setIsConsented] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Qualification is present but OPTIONAL
  const [documents, setDocuments] = useState<DraftDocument[]>([
    { id: "doc_aadhaar", type: "AADHAAR", status: "IDLE" },
    { id: "doc_pan", type: "PAN", status: "IDLE" },
    { id: "doc_cert", type: "CERTIFICATE", status: "IDLE" }, // Optional
  ]);

  // --- 1. Handle File Selection & Immediate Upload ---
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeSlotId) return;

    // Validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      showError("Invalid file type. JPG, PNG, or PDF only.");
      resetInput();
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      showError("File too large. Max 2MB.");
      resetInput();
      return;
    }

    // Set Uploading State
    setDocuments(prev => prev.map(doc => 
      doc.id === activeSlotId 
        ? { ...doc, file, status: "UPLOADING", errorMessage: undefined } 
        : doc
    ));

    // Upload to Server
    try {
      const response = await technicianOnboardingRepository.uploadDocument(file);
      
      setDocuments(prev => prev.map(doc => 
        doc.id === activeSlotId 
          ? { ...doc, status: "SUCCESS", serverUrl: response.url } 
          : doc
      ));
    } catch (err: unknown) {
       const msg = err instanceof Error ? err.message : "Upload failed";
       setDocuments(prev => prev.map(doc => 
        doc.id === activeSlotId ? { ...doc, status: "ERROR", errorMessage: msg } : doc
      ));
    } finally {
      resetInput();
    }
  };

  const resetInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setActiveSlotId(null);
  };

  const triggerFileInput = (slotId: string) => {
    setActiveSlotId(slotId);
    fileInputRef.current?.click();
  };

  // --- 2. Custom Document Logic ---
  const addCustomDoc = () => {
    const newId = `doc_custom_${Date.now()}`;
    setDocuments(prev => [
      ...prev, 
      { id: newId, type: "OTHER", customName: "", status: "IDLE" }
    ]);
  };

  const removeDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const updateCustomName = (id: string, name: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, customName: name } : d));
  };

  // --- 3. Final Submit ---
  const handleNext = async () => {
    // ✅ VALIDATION: Only Aadhaar and PAN are mandatory
    const mandatoryIds = ["doc_aadhaar", "doc_pan"];
    const mandatoryDocs = documents.filter(d => mandatoryIds.includes(d.id));
    const allMandatoryDone = mandatoryDocs.every(d => d.status === "SUCCESS" && d.serverUrl);

    if (!allMandatoryDone) {
      showError("Aadhaar Card and PAN Card are mandatory.");
      return;
    }

    // Validate Custom Names
    const invalidCustomDocs = documents.find(d => d.type === "OTHER" && !d.customName?.trim());
    if (invalidCustomDocs) {
      showError("Please give a name to your additional documents.");
      return;
    }

    if (!isConsented) {
      showError("Please provide consent to proceed.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Filter only successful uploads
      const successfulDocs = documents.filter(d => d.status === "SUCCESS" && d.serverUrl);

      const payload: DocumentMeta[] = successfulDocs.map(d => ({
        type: d.type === "OTHER" ? "OTHER" : d.type,
        fileName: d.type === "OTHER" ? d.customName! : d.file?.name || "document",
        fileUrl: d.serverUrl! 
      }));

      // Save Metadata
      await technicianOnboardingRepository.updateStep5({ documents: payload });

      // Update Redux
      const reduxDocs = payload.map(p => ({
         type: p.type,
         fileUrl: p.fileUrl,
         fileName: p.fileName,
         status: "PENDING" as const
      }));
      
      dispatch(updateDocuments(reduxDocs));
      dispatch(setOnboardingStep(6));

      showSuccess("Documents uploaded successfully!");
      onNext();
    } catch {
      showError("Failed to save documents.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render Logic ---
  const renderDocRow = (doc: DraftDocument) => {
    const isMandatory = ["AADHAAR", "PAN"].includes(doc.type);
    const isCustom = doc.type === "OTHER";

    let label = "";
    if (!isCustom) {
       if (doc.type === "AADHAAR") label = "Aadhaar Card";
       else if (doc.type === "PAN") label = "PAN Card";
       else if (doc.type === "CERTIFICATE") label = "Qualification / Resume";
    }

    return (
      <div key={doc.id} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:border-blue-200">
        
        {/* Icon & Details */}
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
             doc.status === "SUCCESS" ? "bg-green-100 text-green-600" : 
             doc.status === "ERROR" ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600"
          }`}>
             {doc.status === "UPLOADING" ? <Loader2 className="w-6 h-6 animate-spin" /> :
              doc.status === "SUCCESS" ? <CheckCircle2 className="w-6 h-6" /> :
              doc.status === "ERROR" ? <AlertCircle className="w-6 h-6" /> :
              <FileText className="w-6 h-6" />}
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            {isCustom ? (
               // ✅ Custom Name Input
               <input 
                 type="text" 
                 placeholder="Enter Document Name (e.g. Driving License)"
                 className="font-semibold text-gray-900 placeholder:text-gray-400 border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent py-1 w-full max-w-xs transition-colors"
                 value={doc.customName}
                 onChange={(e) => updateCustomName(doc.id, e.target.value)}
                 disabled={doc.status === "UPLOADING"} // Disable while uploading
               />
            ) : (
               <h4 className="font-semibold text-gray-900 truncate flex items-center gap-2">
                 {label} 
                 {isMandatory ? (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wide">Required</span>
                 ) : (
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wide">Optional</span>
                 )}
               </h4>
            )}
            
            {/* Status Text */}
            <div className="mt-0.5">
              {doc.status === "IDLE" && <p className="text-xs text-gray-400">Tap 'Select File' to upload</p>}
              {doc.status === "UPLOADING" && <p className="text-xs text-blue-600 font-medium">Uploading...</p>}
              {doc.status === "SUCCESS" && <p className="text-xs text-green-600 font-medium truncate">{doc.file?.name}</p>}
              {doc.status === "ERROR" && <p className="text-xs text-red-600 font-medium">{doc.errorMessage || "Upload failed"}</p>}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
           {doc.status !== "UPLOADING" && (
             <>
               <button 
                 onClick={() => triggerFileInput(doc.id)}
                 className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                   doc.status === "SUCCESS" 
                     ? "bg-white border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300"
                     : "bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100"
                 }`}
               >
                 {doc.status === "SUCCESS" ? "Change" : "Select File"}
               </button>

               {/* Delete Button for Custom or Optional files */}
               {(!isMandatory || doc.status === "SUCCESS") && (
                  (isCustom || (!isMandatory && doc.status === "SUCCESS")) && ( // Allow clearing optional successful uploads
                    <button 
                      onClick={() => isCustom ? removeDoc(doc.id) : setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: "IDLE", file: undefined, serverUrl: undefined } : d))}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )
               )}
             </>
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
       <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/jpeg,image/png,image/jpg,application/pdf"
          onChange={handleFileSelect}
       />

       <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-blue-600" /> Upload Documents
        </h3>
        <p className="text-sm text-gray-500">
          We need to verify your identity. Aadhaar and PAN are required. You can add other certifications to boost your profile.
        </p>
      </div>

      <div className="space-y-3">
        {documents.map(renderDocRow)}
        
        <button 
          onClick={addCustomDoc}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 font-bold hover:border-blue-400 hover:text-blue-600 transition-all bg-gray-50/50 hover:bg-blue-50/30"
        >
          <Plus className="w-5 h-5" /> Add Additional Document
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl mt-4">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 ${
             isConsented ? "bg-blue-600 border-blue-600" : "bg-white border-blue-300 group-hover:border-blue-500"
          }`}>
            {isConsented && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          </div>
          <input type="checkbox" className="hidden" checked={isConsented} onChange={(e) => setIsConsented(e.target.checked)} />
          <span className="text-sm font-bold text-gray-900 select-none">
             I verify that these documents belong to me and give consent for verification.
          </span>
        </label>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-100">
        <button onClick={onBack} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <button 
          onClick={handleNext}
          disabled={isSubmitting || !isConsented} 
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Next Step <ArrowRight className="w-5 h-5" /></>}
        </button>
      </div>
    </div>
  );
};

export default Step5_Documents;