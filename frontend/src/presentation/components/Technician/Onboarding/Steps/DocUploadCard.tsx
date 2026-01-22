import React, { useState, useRef } from "react";
import { 
  UploadCloud, Eye, Trash2, FileText, CheckCircle2, AlertCircle 
} from "lucide-react";
import type { UploadedDoc, DocType } from "./step5.config";

interface DocUploadCardProps {
  label: string;
  docType: DocType;
  docData?: UploadedDoc;
  isOptional?: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
  onView: (url: string, type: string) => void;
  isCustom?: boolean;
  onUpdateName?: (name: string) => void;
}

export const DocUploadCard: React.FC<DocUploadCardProps> = ({ 
  label, 
  docType, 
  docData, 
  isOptional, 
  onUpload, 
  onRemove, 
  onView, 
  isCustom = false, 
  onUpdateName 
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRejected = docData?.status === "REJECTED";
  const isVerified = docData?.status === "APPROVED"; 
  const hasFile = !!docData?.url;
  
  //   LOCKING LOGIC: If verified, user cannot change or delete
  const isLocked = isVerified; 

  // Dynamic Styles
  let borderColor = "border-gray-200 hover:border-blue-400";
  let bgColor = "bg-white";
  
  if (isRejected) {
    borderColor = "border-red-400 ring-1 ring-red-100";
    bgColor = "bg-red-50/20";
  } else if (isVerified) {
    borderColor = "border-emerald-500";
    bgColor = "bg-emerald-50/20";
  } else if (isHovering) {
    borderColor = "border-blue-500";
    bgColor = "bg-blue-50";
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isLocked) { // Prevent drag if locked
        setIsHovering(true);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    if (!isLocked && e.dataTransfer.files?.[0]) { // Prevent drop if locked
        onUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={() => setIsHovering(false)}
      onDrop={handleDrop}
      className={`relative flex flex-col p-4 rounded-xl border-2 border-dashed transition-all duration-200 ${borderColor} ${bgColor}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 mr-2">
          {isCustom ? (
            <input 
                type="text" 
                placeholder="Enter Document Name"
                className="text-sm font-bold text-gray-900 border-b border-gray-300 focus:border-blue-500 outline-none bg-transparent w-full placeholder:font-normal"
                value={docData?.customName || ""}
                onChange={(e) => onUpdateName?.(e.target.value)}
                disabled={isLocked} // Disable renaming if locked
            />
          ) : (
            <h4 className={`text-sm font-bold ${isRejected ? "text-red-700" : "text-gray-700"}`}>
                {label} {!isOptional && <span className="text-red-500">*</span>}
            </h4>
          )}
          {isOptional && !isCustom && <span className="text-[10px] text-gray-400 font-medium block mt-0.5">Optional</span>}
        </div>
        
        {isVerified && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full shrink-0">
            <CheckCircle2 className="w-3 h-3" /> Verified
          </span>
        )}
        {isRejected && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full shrink-0 animate-pulse">
            <AlertCircle className="w-3 h-3" /> Rejected
          </span>
        )}
      </div>

      {hasFile ? (
        <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm group/file">
          <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg text-gray-500 shrink-0 border border-gray-100">
            {docData.url.toLowerCase().includes(".pdf") ? <FileText className="w-5 h-5" /> : <img src={docData.url} alt="" className="w-full h-full object-cover rounded-lg" />}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">
                {docData.file?.name || (isCustom ? docData.customName : label) || "Document"}
            </p>
            <button 
              onClick={() => onView(docData.url, docType)}
              className="text-[10px] text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-0.5 font-bold"
            >
              <Eye className="w-3 h-3" /> Preview
            </button>
          </div>

          {/*   LOCKING LOGIC: Hide delete button if locked */}
          {!isLocked && (
            <button 
                onClick={onRemove}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove File"
            >
                <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <label className={`flex-1 flex flex-col items-center justify-center py-6 cursor-pointer rounded-lg transition-all hover:bg-black/5`}>
          <UploadCloud className={`w-8 h-8 mb-2 transition-transform ${isHovering ? "scale-110 text-blue-500" : "text-gray-300"}`} />
          <span className="text-xs text-blue-600 font-bold">Click to Upload</span>
          <span className="text-[10px] text-gray-400 mt-1">PDF, JPG, PNG (Max 2MB)</span>
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            onChange={(e) => {
                if (e.target.files?.[0]) {
                    onUpload(e.target.files[0]);
                    e.target.value = '';
                }
            }}
          />
        </label>
      )}

      {isRejected && docData?.rejectionReason && (
        <div className="mt-3 text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-100 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span><span className="font-bold">Correct this:</span> {docData.rejectionReason}</span>
        </div>
      )}
    </div>
  );
};