import React, { useState, useCallback } from "react";
import { X, FileText, Eye, Download, Loader2, AlertCircle } from "lucide-react";

interface FileLightboxProps {
  url: string;
  title?: string;
  type?: string;
  onClose: () => void;
}

export const FileLightbox: React.FC<FileLightboxProps> = ({ url, title = "Document Preview", type, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isPdf = url.toLowerCase().includes(".pdf") || type === "application/pdf";

  const handleDownload = useCallback(async (e: React.MouseEvent) => {
  e.preventDefault();
  setIsDownloading(true);
  setError(null);

  try {
    // 1. Fetch the file data
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch file");
    
    // 2. Convert to a blob
    const blob = await response.blob();
    
    // 3. Create a local temporary URL for the downloaded data
    const blobUrl = window.URL.createObjectURL(blob);
    
    // 4. Create a temporary link to trigger the save
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = title || "document"; // Sets the file name
    
    document.body.appendChild(link);
    link.click();
    
    // 5. Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    
    setIsDownloading(false);
  } catch (err) {
    console.error("Download failed:", err);
    setError("Download failed. Opening in new tab...");
    window.open(url, "_blank"); // Fallback: open URL directly
    setIsDownloading(false);
  }
}, [url, title]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all z-10"
        aria-label="Close preview"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-5xl h-[90vh] flex flex-col bg-transparent">
        {/* Header Bar */}
        <div className="flex justify-between items-center text-white mb-4 px-2">
           <div className="flex flex-col">
              <h3 className="font-bold text-lg flex items-center gap-2">
                {isPdf ? <FileText className="w-5 h-5 text-blue-400" /> : <Eye className="w-5 h-5 text-green-400" />} 
                {title}
              </h3>
              {error && (
                <span className="text-red-400 text-xs flex items-center gap-1 mt-1">
                  <AlertCircle size={12} /> {error}
                </span>
              )}
           </div>
           
           <button 
             onClick={handleDownload}
             disabled={isDownloading}
             className="flex items-center gap-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 rounded-lg transition-colors text-white shadow-lg"
           >
             {isDownloading ? (
               <Loader2 className="w-4 h-4 animate-spin" />
             ) : (
               <Download className="w-4 h-4" />
             )}
             {isDownloading ? "Downloading..." : "Download File"}
           </button>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 bg-gray-900/50 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center relative shadow-2xl">
          {isPdf ? (
            <iframe 
                src={`${url}#toolbar=0`} // Hides iframe toolbar for cleaner look
                className="w-full h-full border-none" 
                title="PDF Preview" 
            />
          ) : (
            <img 
                src={url} 
                alt="Preview" 
                className="max-w-full max-h-full object-contain p-2" 
            />
          )}
        </div>
      </div>
    </div>
  );
};