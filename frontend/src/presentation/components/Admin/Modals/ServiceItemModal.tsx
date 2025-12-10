import React, { useState, useEffect } from "react";
import { X, UploadCloud, Plus, Trash2, Loader2, Save, Power, Info } from "lucide-react";
import type { ServiceSpecification, ServiceItem } from "../../../../domain/types/ServiceItem";
import { serviceItemSchema } from "../../../validation/serviceCatalog"; 

interface ServiceItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
  categoryId: string;
  initialData?: ServiceItem | null; // ✅ Data for Editing
  isLoading: boolean;
}

const ServiceItemModal: React.FC<ServiceItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categoryId,
  initialData,
  isLoading,
}) => {
  // --- Form State ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  
  const [specs, setSpecs] = useState<ServiceSpecification[]>([{ title: "", value: "" }]);
  
  // --- Image Handling State ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]); // Visible existing images
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]); // ✅ Track images to delete

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // --- Reset / Pre-fill Logic ---
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit Mode: Pre-fill
        setName(initialData.name);
        setDescription(initialData.description);
        setBasePrice(String(initialData.basePrice));
        setIsActive(initialData.isActive);
        setSpecs(initialData.specifications.length > 0 ? initialData.specifications : [{ title: "", value: "" }]);
        setExistingImages(initialData.imageUrls || []);
      } else {
        // Create Mode: Reset
        setName("");
        setDescription("");
        setBasePrice("");
        setIsActive(true);
        setSpecs([{ title: "", value: "" }]);
        setExistingImages([]);
      }
      // Always reset these
      setSelectedFiles([]);
      setNewPreviews([]);
      setImagesToDelete([]);
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => newPreviews.forEach(url => URL.revokeObjectURL(url));
  }, [newPreviews]);

  // --- Handlers: Files ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files) {
        const files = Array.from(e.target.files);
        // Validate total count (Visible Existing + New)
        const totalImages = existingImages.length + selectedFiles.length + files.length;
        
        if (totalImages > 5) {
            setErrors(prev => ({...prev, files: "Max 5 images allowed total."}));
            return;
        }
        
        const previews = files.map(f => URL.createObjectURL(f));
        setSelectedFiles(prev => [...prev, ...files]);
        setNewPreviews(prev => [...prev, ...previews]);
        setErrors(prev => ({...prev, files: ""}));
     }
  }

  const removeNewFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ Remove Existing Image (Adds to delete list)
  const removeExistingImage = (index: number) => {
    const urlToRemove = existingImages[index];
    setImagesToDelete(prev => [...prev, urlToRemove]); // Mark for deletion
    setExistingImages(prev => prev.filter((_, i) => i !== index)); // Hide from UI
  };

  // --- Handlers: Specifications ---
  const updateSpec = (index: number, field: keyof ServiceSpecification, value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };
  const addSpecRow = () => setSpecs([...specs, { title: "", value: "" }]);
  const removeSpecRow = (index: number) => setSpecs(specs.filter((_, i) => i !== index));

  // --- Submit Handler ---
  const handleSubmit = async () => {
    setErrors({});
    
    // 1. Zod Validation (Name, Desc, Price)
    const priceNum = parseFloat(basePrice);
    const result = serviceItemSchema.safeParse({ name, description, basePrice: priceNum });

    let newErrors: any = {};
    if (!result.success) {
      newErrors = result.error.flatten().fieldErrors;
      if (newErrors.name) newErrors.name = newErrors.name[0];
      if (newErrors.description) newErrors.description = newErrors.description[0];
      if (newErrors.basePrice) newErrors.basePrice = newErrors.basePrice[0];
    }

    // 2. Image Validation Logic
    // Must have at least one image remaining (Existing or New)
    const totalRemainingImages = existingImages.length + selectedFiles.length;

    if (totalRemainingImages === 0) {
        newErrors.files = "Service must have at least one image.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // 3. Prepare FormData
    const formData = new FormData();
    formData.append("categoryId", categoryId);
    formData.append("name", name);
    formData.append("description", description);
    formData.append("basePrice", basePrice);
    formData.append("isActive", String(isActive));
    
    const validSpecs = specs.filter(s => s.title.trim() && s.value.trim());
    formData.append("specifications", JSON.stringify(validSpecs));

    // Append New Files
    selectedFiles.forEach(file => formData.append("images", file));

    // ✅ Append Deleted Images List
    if (imagesToDelete.length > 0) {
        formData.append("imagesToDelete", JSON.stringify(imagesToDelete));
    }

    await onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">{initialData ? "Edit Service" : "Add Service"}</h2>
            <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto scrollbar-thin">
            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Service Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} className={`w-full px-4 h-11 border rounded-xl outline-none ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'}`} placeholder="e.g. Split AC Installation" />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                 </div>
                 <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className={`w-full px-4 py-3 border rounded-xl resize-none outline-none ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'}`} placeholder="Describe the service..." />
                    {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Base Price (₹)</label>
                    <input type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} className={`w-full px-4 h-11 border rounded-xl outline-none ${errors.basePrice ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'}`} placeholder="0.00" />
                    {errors.basePrice && <p className="text-xs text-red-500 mt-1">{errors.basePrice}</p>}
                 </div>
            </div>

             {/* Active/Inactive Toggle */}
             <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                    <Power size={18} className={isActive ? "text-green-600" : "text-gray-400"} />
                    <div>
                        <span className="block text-sm font-bold text-gray-700">Service Status</span>
                        <span className="block text-xs text-gray-500">{isActive ? "Visible in App" : "Hidden"}</span>
                    </div>
                </div>
                <button onClick={() => setIsActive(!isActive)} className={`relative h-6 w-11 rounded-full transition ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`block h-4 w-4 bg-white rounded-full shadow transition transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
             </div>

            {/* Specifications */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Specifications</label>
              <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                {specs.map((spec, index) => (
                  <div key={index} className="flex gap-2">
                    <input placeholder="Title" value={spec.title} onChange={e => updateSpec(index, "title", e.target.value)} className="flex-1 px-3 h-10 text-sm border border-gray-200 rounded-lg outline-none" />
                    <input placeholder="Value" value={spec.value} onChange={e => updateSpec(index, "value", e.target.value)} className="flex-1 px-3 h-10 text-sm border border-gray-200 rounded-lg outline-none" />
                    {specs.length > 1 && <button onClick={() => removeSpecRow(index)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>}
                  </div>
                ))}
                <button onClick={addSpecRow} className="flex items-center gap-1 text-sm text-blue-600 font-bold hover:underline mt-2"><Plus size={16} /> Add Specification</button>
              </div>
            </div>

            {/* Image Upload (With Guidelines & Delete) */}
            <div>
              <div className="flex justify-between items-end mb-2">
                 <label className="block text-xs font-bold text-gray-700 uppercase">Images</label>
                 <span className="text-[10px] text-gray-400 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                    <Info size={10} /> Max 5 files. JPG/PNG. &lt;5MB.
                 </span>
              </div>
              
              <div className="grid grid-cols-5 gap-3">
                 {/* Upload Button */}
                 <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <UploadCloud className="text-gray-400" size={20} />
                    <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                 </label>

                 {/* ✅ Show Existing Images (Editable) */}
                 {existingImages.map((url, idx) => (
                    <div key={`old-${idx}`} className="relative h-20 rounded-xl overflow-hidden border border-gray-200 group">
                        <img src={url} className="w-full h-full object-cover opacity-90" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.5">Existing</span>
                        {/* Delete Button */}
                        <button 
                            type="button"
                            onClick={() => removeExistingImage(idx)} 
                            className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                        >
                            <X size={10}/>
                        </button>
                    </div>
                 ))}

                 {/* Show New Previews (Deletable) */}
                 {newPreviews.map((url, idx) => (
                    <div key={`new-${idx}`} className="relative h-20 rounded-xl overflow-hidden border border-blue-200 ring-2 ring-blue-500/20 group">
                        <img src={url} className="w-full h-full object-cover" />
                        <button 
                            type="button"
                            onClick={() => removeNewFile(idx)} 
                            className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                        >
                            <X size={10}/>
                        </button>
                    </div>
                 ))}
              </div>
              {errors.files && <p className="text-xs text-red-500 mt-1">{errors.files}</p>}
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 flex gap-3">
             <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50">Cancel</button>
             <button onClick={handleSubmit} disabled={isLoading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex justify-center items-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {initialData ? "Update Service" : "Save Service"}
             </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceItemModal;