import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight, ArrowLeft, Loader2, UploadCloud, Plus, Save, AlertCircle, CheckCircle2
} from "lucide-react";
import type { AppDispatch, RootState } from "../../../../store/store";
import { technicianOnboardingRepository } from "../../api/technicianOnboardingRepository";
import {
  updateDocuments,
  setOnboardingStep,
  updateVerificationStatus
} from "../../../../store/technicianSlice";
import { useNotification } from "../../../notifications/hooks/useNotification";

import {
  MANDATORY_SLOTS,
  step5Schema,
  type UploadedDoc,
  type DocType
} from "./step5.config";

import { DocUploadCard } from "./DocUploadCard";
import { FileLightbox } from "../../../../components/Shared/FileLightbox/FileLightbox";

const MAX_CUSTOM_DOCS = 5;

interface Step5Props {
  onNext: () => void;
  onBack: () => void;
  onSaveAndExit: () => void;
}

const Step5_Documents: React.FC<Step5Props> = ({ onNext, onBack, onSaveAndExit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.technician);
  const { showSuccess, showError } = useNotification();

  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ url: string, type: string } | null>(null);
  const [isConsented, setIsConsented] = useState(false);

  const isResubmission = profile?.verificationStatus === "REJECTED";
  const hasDocRejections = documents.some(d => d.status === "REJECTED");

  const hasBankDetails =
    !!profile?.bankDetails?.accountNumber &&
    !!profile?.bankDetails?.ifscCode;

  const globalRejectionReason = profile?.globalRejectionReason;

  const isSmartSubmitEligible =
    isResubmission &&
    hasBankDetails &&
    globalRejectionReason === 'Invalid Documents';

  useEffect(() => {
    if (profile?.documents) {
      const mappedDocs: UploadedDoc[] = profile.documents.map((d, index) => ({
        id: `doc_${index}`,
        type: d.type as DocType,
        url: d.fileUrl,
        customName: d.type === "OTHER" ? d.fileName : undefined,
        status: d.status === "REJECTED" ? "REJECTED" : (d.status === "APPROVED" ? "APPROVED" : "PENDING"),
        rejectionReason: d.rejectionReason
      }));
      setDocuments(mappedDocs);

      if (isResubmission) setIsConsented(true);
    }
  }, [profile?.documents, isResubmission]);
 
const handleUpload = async (file: File, type: DocType, id?: string) => {
  if (file.size > 2 * 1024 * 1024) {
    showError("File size must be less than 2MB");
    return;
  }

  const docId = id || `doc_${Date.now()}`;
  setUploadingId(type === 'OTHER' ? docId : type);

  // 1. Create instant local preview URL
  const localPreviewUrl = URL.createObjectURL(file);

  try {
    const response = await technicianOnboardingRepository.uploadDocument(file);

    // The backend returns { data: { url: "..." } }
    const uploadedKey = response.data?.url || response.url; 

    if (!uploadedKey) {
        throw new Error("No URL returned from server");
    }

    setDocuments(prev => {
      const others = type === 'OTHER' ? prev.filter(d => d.id !== docId) : prev.filter(d => d.type !== type);
      return [...others, {
        id: docId,
        type,
        url: localPreviewUrl, // Use local preview so it shows up instantly
        s3Key: uploadedKey,   // Store the real key for the database
        file: file,
        status: "PENDING",
        customName: type === 'OTHER' ? "New Document" : undefined
      }];
    });
    
    showSuccess("Document uploaded!");
  } catch  {
    showError("Upload failed. Please try again.");
  } finally {
    setUploadingId(null);
  }
};

  const handleRemove = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const handleAddCustom = () => {
    const currentCustomDocs = documents.filter(d => d.type === "OTHER").length;

    if (currentCustomDocs >= MAX_CUSTOM_DOCS) {
      showError(`You can only upload up to ${MAX_CUSTOM_DOCS} additional documents.`);
      return;
    }

    const id = `doc_custom_${Date.now()}`;
    setDocuments(prev => [...prev, {
      id, type: "OTHER", url: "", status: "PENDING", customName: ""
    }]);
  };

  const saveDocumentsToBackend = async () => {
  const payload = documents
    .filter(d => d.url)
    .map(d => ({
      type: d.type, 
      fileUrl: d.s3Key || d.url, 
      fileName: d.customName || d.file?.name || d.type
    }));

  await technicianOnboardingRepository.updateStep5({ documents: payload });

  const reduxDocs = documents.map(d => ({
    type: d.type,
    fileUrl: d.s3Key || d.url, // Keep keys in Redux for consistent mapping
    fileName: d.customName || d.file?.name || d.type,
    status: d.status
  }));

  dispatch(updateDocuments(reduxDocs));
};

  const handleNextClick = async () => {
    const result = step5Schema.safeParse({ documents });
    if (!result.success) {
      showError(result.error.errors[0].message);
      return;
    }
    if (!isConsented) {
      showError("Please check the consent box to proceed.");
      return;
    }

    if (isResubmission) {
      const stillHasRejections = documents.some(d => d.status === "REJECTED");
      if (stillHasRejections) {
        showError("Please replace all rejected documents.");
        return;
      }
    }

    try {
      setSaving(true);
      await saveDocumentsToBackend();

      if (isSmartSubmitEligible && profile?.bankDetails) {
        try {
          const step6Payload = {
            bankDetails: {
              accountHolderName: profile.bankDetails.accountHolderName,
              accountNumber: profile.bankDetails.accountNumber,
              ifscCode: profile.bankDetails.ifscCode,
              bankName: profile.bankDetails.bankName
            }
          };

          await technicianOnboardingRepository.updateStep6(step6Payload);

          dispatch(updateVerificationStatus({ status: "VERIFICATION_PENDING" }));
          dispatch(setOnboardingStep(7));

          showSuccess("Application Resubmitted Successfully!");
          return;
        } catch (err) {
          console.error(err);
          showError("Failed to resubmit application.");
          setSaving(false);
          return;
        }
      }

      dispatch(setOnboardingStep(6));
      showSuccess("Documents saved!");
      onNext();

    } catch {
      showError("Failed to save documents.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveExitClick = async () => {
    if (!isConsented) { showError("Please consent before saving."); return; }
    try {
      setSaving(true);
      await saveDocumentsToBackend();
      showSuccess("Progress saved.");
      onSaveAndExit();
    } catch {
      showError("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const customDocCount = documents.filter(d => d.type === 'OTHER').length;
  const isCapReached = customDocCount >= MAX_CUSTOM_DOCS;

  return (
    <div className="space-y-8 animate-fade-in pb-12">

      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-blue-600" /> Upload Documents
        </h3>
        <p className="text-sm text-gray-500">
          We need to verify your identity. All data is securely encrypted.
        </p>

        {isResubmission && hasDocRejections && (
          <div className="mt-1 bg-red-50 border border-red-100 rounded-lg p-3 flex items-center gap-2 text-red-800 text-sm font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4" />
            Action Required: One or more documents were rejected. Please re-upload them.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MANDATORY_SLOTS.map((slot) => {
          const doc = documents.find(d => d.type === slot.type);
          const isUploading = uploadingId === slot.type;

          return (
            <div key={slot.type} className="relative">
              {isUploading && (
                <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center rounded-xl border border-blue-100 backdrop-blur-[1px]">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-xs font-bold text-blue-600">Uploading...</span>
                  </div>
                </div>
              )}

              <DocUploadCard
                label={slot.label}
                docType={slot.type}
                isOptional={slot.isOptional}
                docData={doc}
                onUpload={(file) => handleUpload(file, slot.type)}
                onRemove={() => doc && handleRemove(doc.id)}
                onView={(url, type) => setPreviewDoc({ url, type })}
              />
            </div>
          );
        })}

        {documents.filter(d => d.type === 'OTHER').map((doc) => {
          const isUploading = uploadingId === doc.id;
          return (
            <div key={doc.id} className="relative">
              {isUploading && (
                <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center rounded-xl">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              )}
              <DocUploadCard
                label="Additional Document"
                docType="OTHER"
                isCustom
                isOptional
                docData={doc}
                onUpload={(file) => handleUpload(file, "OTHER", doc.id)}
                onRemove={() => handleRemove(doc.id)}
                onView={(url, type) => setPreviewDoc({ url, type })}
                onUpdateName={(name) => setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, customName: name } : d))}
              />
            </div>
          );
        })}

        <button
          onClick={handleAddCustom}
          disabled={isCapReached}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all group ${isCapReached
              ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
              : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer"
            }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform ${isCapReached ? "bg-gray-200 text-gray-400" : "bg-blue-50 text-blue-600 group-hover:scale-110"}`}>
            <Plus className="w-6 h-6" />
          </div>
          <span className={`text-sm font-bold ${isCapReached ? "text-gray-400" : "text-gray-600 group-hover:text-blue-700"}`}>
            {isCapReached ? "Limit Reached" : "Add Another Document"}
          </span>
          <span className="text-[10px] text-gray-400 mt-1 font-medium">
            {customDocCount} / {MAX_CUSTOM_DOCS} additional files
          </span>
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl cursor-pointer hover:bg-blue-100/50 transition-colors" onClick={() => setIsConsented(!isConsented)}>
        <label className="flex items-start gap-3 cursor-pointer group pointer-events-none">
          <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0 ${isConsented ? "bg-blue-600 border-blue-600" : "bg-white border-blue-300"}`}>
            {isConsented && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
          </div>
          <span className="text-sm font-bold text-gray-900 select-none">
            I verify that these documents belong to me and give consent for verification.
          </span>
        </label>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-6 border-t border-gray-100">
        <button
          onClick={onBack}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          {!isResubmission && (
            <button
              onClick={handleSaveExitClick}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-50"
            >
              <Save className="w-5 h-5" /> Save & Exit
            </button>
          )}

          <button
            onClick={handleNextClick}
            disabled={saving || uploadingId !== null}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-600/20"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                {isSmartSubmitEligible
                  ? "Submit Application"
                  : (isResubmission ? "Continue" : "Next Step")
                }
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      {previewDoc && (
        <FileLightbox
          url={previewDoc.url}
          title={previewDoc.type.replace(/_/g, " ")}
          type={previewDoc.type}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};

export default Step5_Documents;