import React from "react";
import { X, FileText, Eye, Download } from "lucide-react";

interface FileLightboxProps {
  url: string;
  title?: string;
  type?: string; // Optional, can be inferred
  onClose: () => void;
}

export const FileLightbox: React.FC<FileLightboxProps> = ({ url, title = "Document Preview", type, onClose }) => {
  // Simple check for PDF based on URL or Type
  const isPdf = url.toLowerCase().includes(".pdf") || type === "application/pdf";

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
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
           <a 
             href={url} 
             target="_blank" 
             rel="noreferrer" 
             download
             className="flex items-center gap-2 text-sm font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors text-white"
           >
             <Download className="w-4 h-4" /> Download
           </a>
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