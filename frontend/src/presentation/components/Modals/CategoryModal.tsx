import React, { useState, useEffect } from "react";
import { X, UploadCloud, Image as ImageIcon, Power, Loader2, Save } from "lucide-react";
import type { ServiceCategory } from "../../../domain/types/ServiceCategory";

// ✅ Import the Reusable Schema
import { categorySchema } from "../../validation/serviceCatalog";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
  initialData?: ServiceCategory | null;
  isLoading: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isLoading,
}) => {
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  // Image State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Error State
  const [errors, setErrors] = useState<{ name?: string; description?: string; file?: string }>({});

  // Reset or Load Data when Modal Opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit Mode
        setName(initialData.name);
        setDescription(initialData.description);
        setIsActive(initialData.isActive);
        setPreviewUrl(initialData.iconUrl); // Show existing S3 image
        setSelectedFile(null);
      } else {
        // Create Mode (Reset)
        setName("");
        setDescription("");
        setIsActive(true);
        setPreviewUrl(null);
        setSelectedFile(null);
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Manual File Type/Size Check (React specific)
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, file: "Please select a valid image file (JPG, PNG)." }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, file: "Image size should be less than 5MB." }));
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Create local preview
      setErrors((prev) => ({ ...prev, file: undefined }));
    }
  };

  const handleSubmit = async () => {
    setErrors({});

    // 1. Zod Validation (Using Shared Schema)
    const result = categorySchema.safeParse({ name, description });
    
    if (!result.success) {
      const formattedErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: formattedErrors.name?.[0],
        description: formattedErrors.description?.[0],
      });
      return;
    }

    // 2. Custom File Validation (Required only for new categories)
    if (!initialData && !selectedFile) {
      setErrors(prev => ({ ...prev, file: "Please upload a category icon." }));
      return;
    }

    // 3. Prepare FormData
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("isActive", String(isActive));
    
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    await onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
          
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {initialData ? "Edit Category" : "New Service Category"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {initialData ? "Update category details and icon" : "Create a new main category for services"}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            
            {/* Image Upload Section */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Category Icon <span className="text-red-500">*</span>
              </label>
              
              <div className="flex items-start gap-4">
                {/* Preview Box */}
                <div className={`
                  w-24 h-24 shrink-0 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50 relative group
                  ${errors.file ? "border-red-300 bg-red-50" : "border-gray-300"}
                `}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="text-gray-300" size={32} />
                  )}
                  {/* Overlay on Hover */}
                  <label htmlFor="modal-file-upload" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <UploadCloud className="text-white" size={24} />
                  </label>
                </div>

                {/* Upload Controls */}
                <div className="flex-1">
                  <input 
                    id="modal-file-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                  <div className="flex flex-col gap-1">
                    <label 
                      htmlFor="modal-file-upload" 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all w-max shadow-sm"
                    >
                      <UploadCloud size={16} />
                      {selectedFile ? "Change Image" : "Upload Image"}
                    </label>
                    <p className="text-xs text-gray-400 mt-1">
                      Recommended: 500x500px, JPG or PNG. Max 5MB.
                    </p>
                    {errors.file && (
                      <p className="text-xs text-red-500 font-medium mt-1">{errors.file}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AC Repair"
                  className={`w-full px-4 h-12 text-sm border rounded-xl focus:ring-2 outline-none transition-all placeholder:text-gray-400 ${
                    errors.name 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/10"
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1 font-medium">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Briefly describe the services in this category..."
                  className={`w-full px-4 py-3 text-sm border rounded-xl focus:ring-2 outline-none transition-all resize-none placeholder:text-gray-400 ${
                    errors.description 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" 
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/10"
                  }`}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1 font-medium">{errors.description}</p>}
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                    <Power size={18} />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-gray-900">Active Status</span>
                    <span className="block text-xs text-gray-500">
                      {isActive ? "Visible to customers" : "Hidden from app"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50/50">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-sm hover:shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {initialData ? "Update Category" : "Save Category"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryModal;