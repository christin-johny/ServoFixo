import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point, CropperProps } from "react-easy-crop";
import { X, ZoomIn, Loader2, Check } from "lucide-react";
import { getCroppedImg } from "./imageUtils";

// Fix for library import mismatch
const EasyCrop = Cropper as unknown as React.ComponentType<Partial<CropperProps>>;

interface ImageCropperModalProps {
  imageSrc: string;
  onClose: () => void;
  onCropConfirm: (blob: Blob) => Promise<void>;
  isUploading: boolean;
  // ✅ New Props for Reusability
  aspect?: number;        // Default: 1 (Square)
  circular?: boolean;     // Default: true (Round)
  title?: string;         // Default: "Adjust Photo"
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ 
  imageSrc, 
  onClose, 
  onCropConfirm, 
  isUploading,
  aspect = 1,
  circular = true,
  title = "Adjust Photo"
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (croppedAreaPixels) {
      try {
        const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
        await onCropConfirm(blob);
      } catch (error) {
        console.error("Crop failed", error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800">{title}</h3>
          <button 
            onClick={onClose} 
            type="button"
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Cropper Area */}
        <div className="relative h-64 w-full bg-black">
           <EasyCrop
             image={imageSrc}
             crop={crop}
             zoom={zoom}
             aspect={aspect}
             onCropChange={setCrop}
             onCropComplete={onCropComplete}
             onZoomChange={setZoom}
             showGrid={!circular} // Show grid only for rectangular crops
             cropShape={circular ? "round" : "rect"}
           />
        </div>

        {/* Controls */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-gray-500">
            <ZoomIn className="w-4 h-4" />
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              aria-label="Zoom Image"
            />
          </div>
          
          <div className="flex gap-3 pt-2">
            <button 
              onClick={onClose}
              type="button"
              className="flex-1 py-2.5 text-gray-700 font-bold hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              type="button"
              disabled={isUploading}
              className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Set Picture
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropperModal;