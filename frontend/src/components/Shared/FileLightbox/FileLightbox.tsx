import React, { useState, useCallback } from "react";
import { X, FileText, Eye, Download, Loader2 } from "lucide-react";

interface FileLightboxProps {
  url: string;
  title?: string;
  type?: string; 
  onClose: () => void;
}

export const FileLightbox: React.FC<FileLightboxProps> = ({ url, title = "Document Preview", type, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const isPdf = url.toLowerCase().includes(".pdf") || type === "application/pdf";

  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDownloading(true);

    try {
      // Fetch the file as a blob to bypass origin restrictions for the 'download' attribute
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      
      // Attempt to preserve the original filename or use the title
      const fileName = url.split("/").pop() || (isPdf ? "document.pdf" : "image.jpg");
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed, falling back to direct link:", error);
      // Fallback: Open in new tab if Fetch/CORS fails
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setIsDownloading(false);
    }
  }, [url, isPdf]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
        aria-label="Close preview"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-5xl h-[90vh] flex flex-col bg-transparent">
        {/* Header Bar */}
        <div className="flex justify-between items-center text-white mb-4 px-2">
           <h3 className="font-bold text-lg flex items-center gap-2">
             {isPdf ? <FileText className="w-5 h-5 text-blue-400" /> : <Eye className="w-5 h-5 text-green-400" />} 
             {title}
           </h3>
           
           <button 
             onClick={handleDownload}
             disabled={isDownloading}
             className="flex items-center gap-2 text-sm font-medium bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors text-white"
           >
             {isDownloading ? (
               <Loader2 className="w-4 h-4 animate-spin" />
             ) : (
               <Download className="w-4 h-4" />
             )}
             {isDownloading ? "Processing..." : "Download"}
           </button>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 bg-gray-900/50 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center relative shadow-2xl">
          {isPdf ? (
            <iframe 
                src={url} 
                className="w-full h-full border-none" 
                title="PDF Preview" 
            />
          ) : (
            <img 
                src={url} 
                alt="Preview" 
                className="max-w-full max-h-full object-contain" 
            />
          )}
        </div>
      </div>
    </div>
  );
};