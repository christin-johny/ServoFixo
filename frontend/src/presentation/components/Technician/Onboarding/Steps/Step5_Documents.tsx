import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  ArrowRight, ArrowLeft, Loader2, UploadCloud, FileText, CheckCircle2, AlertCircle, Plus, Trash2, Eye, RefreshCw
} from "lucide-react";
import type { RootState, AppDispatch } from "../../../../../store/store";
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
 
type DocType = "AADHAAR" | "PAN" | "CERTIFICATE" | "OTHER";

interface DraftDocument {
  id: string;
  type: DocType;
  customName?: string; 
  file?: File;
  serverUrl?: string; 
  status: "IDLE" | "UPLOADING" | "SUCCESS" | "ERROR" | "REJECTED";
  errorMessage?: string;
  rejectionReason?: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];

const Step5_Documents: React.FC<Step5Props> = ({ onNext, onBack }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.technician);
  const { showSuccess, showError } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [isConsented, setIsConsented] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
 
  const [documents, setDocuments] = useState<DraftDocument[]>([
    { id: "doc_aadhaar", type: "AADHAAR", status: "IDLE" },
    { id: "doc_pan", type: "PAN", status: "IDLE" },
  ]);
 
  useEffect(() => {
    if (profile?.documents && profile.documents.length > 0) {
      const mergedDocs: DraftDocument[] = [];
      
      profile.documents.forEach((d, index) => { 
        let docType: DocType = "OTHER";
        if (d.type === "AADHAAR" || d.type === "PAN" || d.type === "CERTIFICATE") {
            docType = d.type as DocType;
        }

        let id = "";
        if (docType === "AADHAAR") id = "doc_aadhaar";
        else if (docType === "PAN") id = "doc_pan";
        else if (docType === "CERTIFICATE") id = "doc_cert";
        else id = `doc_custom_${index}`;

        mergedDocs.push({
          id,
          type: docType,
          customName: docType === "OTHER" ? d.fileName : undefined,
          serverUrl: d.fileUrl, 
          status: d.status === "REJECTED" ? "REJECTED" : "SUCCESS", 
          rejectionReason: d.rejectionReason
        });
      });
 
      if (!mergedDocs.find(d => d.type === "AADHAAR")) {
          mergedDocs.unshift({ id: "doc_aadhaar", type: "AADHAAR", status: "IDLE" });
      }
      if (!mergedDocs.find(d => d.type === "PAN")) { 
          const aadhaarIndex = mergedDocs.findIndex(d => d.type === "AADHAAR");
          mergedDocs.splice(aadhaarIndex + 1, 0, { id: "doc_pan", type: "PAN", status: "IDLE" });
      }

      setDocuments(mergedDocs);
    }
  }, [profile?.documents]);
 
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeSlotId) return;

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
 
    setDocuments(prev => prev.map(doc => 
      doc.id === activeSlotId 
        ? { ...doc, file, status: "UPLOADING", errorMessage: undefined, rejectionReason: undefined } 
        : doc
    ));

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
 
  const addCustomDoc = () => {
    const newId = `doc_custom_${Date.now()}`;
    setDocuments(prev => [...prev, { id: newId, type: "OTHER", customName: "", status: "IDLE" }]);
  };

  const removeDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const updateCustomName = (id: string, name: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, customName: name } : d));
  };
 
  const handleNext = async () => {
    const mandatoryIds = ["doc_aadhaar", "doc_pan"];
     
    const mandatoryDocs = documents.filter(d => mandatoryIds.includes(d.id));
    const allMandatoryDone = mandatoryDocs.every(d => d.serverUrl && (d.status === "SUCCESS" || d.status === "REJECTED")); 
     
    const hasRejections = documents.some(d => d.status === "REJECTED");
    if (hasRejections) {
      showError("Please replace the rejected documents before proceeding.");
      return;
    }

    if (!allMandatoryDone) {
      showError("Aadhaar Card and PAN Card are mandatory.");
      return;
    }

    const invalidCustomDocs = documents.find(d => d.type === "OTHER" && !d.customName?.trim());
    if (invalidCustomDocs) {
      showError("Please name your additional documents.");
      return;
    }

    if (!isConsented) {
      showError("Please provide consent to proceed.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload: DocumentMeta[] = documents
        .filter(d => d.serverUrl)  
        .map(d => ({
          type: d.type === "OTHER" ? "OTHER" : d.type,
          fileName: d.type === "OTHER" ? d.customName! : (d.file?.name || d.type),
          fileUrl: d.serverUrl!
        }));

      await technicianOnboardingRepository.updateStep5({ documents: payload });
 
      const reduxDocs = payload.map(p => ({
         type: p.type,
         fileUrl: p.fileUrl,
         fileName: p.fileName,
         status: "PENDING" as const 
      }));
      
      dispatch(updateDocuments(reduxDocs));
      dispatch(setOnboardingStep(6));

      showSuccess("Documents saved successfully!");
      onNext();
    } catch {
      showError("Failed to save documents.");
    } finally {
      setIsSubmitting(false);
    }
  };
 
  const renderDocRow = (doc: DraftDocument) => {
    const isMandatory = ["AADHAAR", "PAN"].includes(doc.type);
    const isCustom = doc.type === "OTHER";
    const isRejected = doc.status === "REJECTED";

    let label = "";
    if (!isCustom) {
       if (doc.type === "AADHAAR") label = "Aadhaar Card";
       else if (doc.type === "PAN") label = "PAN Card";
       else if (doc.type === "CERTIFICATE") label = "Qualification / Resume";
    }

    return (
      <div 
        key={doc.id} 
        className={`border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 transition-all 
          ${isRejected ? "border-red-300 bg-red-50" : "border-gray-200 bg-white hover:border-blue-200"}`}
      >
        
        {/* Status Icon */}
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
             doc.status === "UPLOADING" ? "bg-blue-50 text-blue-600" :
             isRejected ? "bg-red-100 text-red-600" :
             doc.status === "SUCCESS" ? "bg-green-100 text-green-600" :
             doc.status === "ERROR" ? "bg-red-100 text-red-600" :
             "bg-gray-100 text-gray-500"
          }`}>
             {doc.status === "UPLOADING" ? <Loader2 className="w-6 h-6 animate-spin" /> :
              isRejected ? <AlertCircle className="w-6 h-6" /> :
              doc.status === "SUCCESS" ? <CheckCircle2 className="w-6 h-6" /> :
              doc.status === "ERROR" ? <AlertCircle className="w-6 h-6" /> :
              <FileText className="w-6 h-6" />}
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            {isCustom ? (
               <input 
                 type="text" 
                 placeholder="Document Name"
                 className="font-semibold text-gray-900 border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent py-1 w-full max-w-xs"
                 value={doc.customName}
                 onChange={(e) => updateCustomName(doc.id, e.target.value)}
                 disabled={doc.status === "UPLOADING"} 
               />
            ) : (
               <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                 {label} 
                 {isMandatory && <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">REQUIRED</span>}
               </h4>
            )}
            
            {/* Status Messages */}
            <div className="mt-1">
              {isRejected && (
                <p className="text-xs font-bold text-red-700">
                  Rejected: {doc.rejectionReason || "Please re-upload a valid document."}
                </p>
              )}
              {doc.status === "ERROR" && <p className="text-xs text-red-600">{doc.errorMessage}</p>}
              {doc.status === "SUCCESS" && <p className="text-xs text-green-600 font-medium">Document uploaded</p>}
              {doc.status === "IDLE" && <p className="text-xs text-gray-400">Tap select to upload</p>}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center">
           {/* View Button (If URL exists) */}
           {doc.serverUrl && (
             <a 
               href={doc.serverUrl} 
               target="_blank" 
               rel="noreferrer"
               className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
               title="View Current File"
             >
               <Eye className="w-5 h-5" />
             </a>
           )}

           {doc.status !== "UPLOADING" && (
             <>
               <button 
                 onClick={() => triggerFileInput(doc.id)}
                 className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border flex items-center gap-2 ${
                   isRejected 
                     ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
                     : doc.status === "SUCCESS" 
                       ? "bg-white border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300"
                       : "bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100"
                 }`}
               >
                 {isRejected ? <><RefreshCw className="w-4 h-4"/> Replace</> : doc.status === "SUCCESS" ? "Change" : "Select File"}
               </button>

               {/* Delete (Only if Custom or Optional) */}
               {(!isMandatory || (doc.status === "SUCCESS" && !isRejected)) && (
                  (isCustom || (!isMandatory)) && (
                    <button 
                      onClick={() => isCustom ? removeDoc(doc.id) : setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: "IDLE", file: undefined, serverUrl: undefined } : d))}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
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
       <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg,image/png,image/jpg,application/pdf" onChange={handleFileSelect} />

       <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-blue-600" /> Upload Documents
        </h3>
        <p className="text-sm text-gray-500">
          We need to verify your identity. If a document was rejected, please replace it to proceed.
        </p>
      </div>

      <div className="space-y-3">
        {documents.map(renderDocRow)}
        <button onClick={addCustomDoc} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 font-bold hover:border-blue-400 hover:text-blue-600 bg-gray-50/50 hover:bg-blue-50/30">
          <Plus className="w-5 h-5" /> Add Additional Document
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl mt-4">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 ${isConsented ? "bg-blue-600 border-blue-600" : "bg-white border-blue-300 group-hover:border-blue-500"}`}>
            {isConsented && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          </div>
          <input type="checkbox" className="hidden" checked={isConsented} onChange={(e) => setIsConsented(e.target.checked)} />
          <span className="text-sm font-bold text-gray-900 select-none">I verify that these documents belong to me and give consent for verification.</span>
        </label>
      </div>

      <div className="flex justify-between pt-6 border-t border-gray-100">
        <button onClick={onBack} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <button onClick={handleNext} disabled={isSubmitting || !isConsented} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Save & Continue <ArrowRight className="w-5 h-5" /></>}
        </button>
      </div>
    </div>
  );
};

export default Step5_Documents;