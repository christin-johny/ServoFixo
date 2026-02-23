import React, { useState, useEffect } from "react";
import { X, UploadCloud, Plus, Trash2, Loader2, Save, Power, Info } from "lucide-react";
import type { ServiceSpecification, ServiceItem } from "../../types/ServiceItem";
import { serviceItemSchema } from "../../../../utils/validation/serviceCatalog"; 

interface ServiceItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: FormData) => Promise<void>;
  categoryId: string;
  initialData?: ServiceItem | null; 
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

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  
  const [specs, setSpecs] = useState<ServiceSpecification[]>([{ title: "", value: "" }]);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]); 
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]); 
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setDescription(initialData.description);
        setBasePrice(String(initialData.basePrice));
        setIsActive(initialData.isActive);
        setSpecs(initialData.specifications.length > 0 ? initialData.specifications : [{ title: "", value: "" }]);
        setExistingImages(initialData.imageUrls || []);
      } else {
        setName("");
        setDescription("");
        setBasePrice("");
        setIsActive(true);
        setSpecs([{ title: "", value: "" }]);
        setExistingImages([]);
      }
      setSelectedFiles([]);
      setNewPreviews([]);
      setImagesToDelete([]);
      setErrors({});
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    return () => newPreviews.forEach(url => URL.revokeObjectURL(url));
  }, [newPreviews]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; 

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      const hasLargeFile = files.some(file => file.size > MAX_FILE_SIZE);
      if (hasLargeFile) {
        setErrors(prev => ({ ...prev, files: "Files should be less than 5MB in size." }));
        e.target.value = ""; 
        return;
      }

      const totalImages = existingImages.length + selectedFiles.length + files.length;
      
      if (totalImages > 5) {
        setErrors(prev => ({ ...prev, files: "Max 5 images allowed total." }));
        return;
      }
    
      const previews = files.map(f => URL.createObjectURL(f));
      setSelectedFiles(prev => [...prev, ...files]);
      setNewPreviews(prev => [...prev, ...previews]);
      setErrors(prev => ({ ...prev, files: "" })); 
    }
  };

  const removeNewFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    const urlToRemove = existingImages[index];
    setImagesToDelete(prev => [...prev, urlToRemove]);
    setExistingImages(prev => prev.filter((_, i) => i !== index)); 
  };

  const updateSpec = (index: number, field: keyof ServiceSpecification, value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };
  const addSpecRow = () => setSpecs([...specs, { title: "", value: "" }]);
  const removeSpecRow = (index: number) => setSpecs(specs.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setErrors({});
    const priceNum = parseFloat(basePrice);
    const result = serviceItemSchema.safeParse({ name, description, basePrice: priceNum });

    let newErrors: any = {};
    if (!result.success) {
      newErrors = result.error.flatten().fieldErrors;
      if (newErrors.name) newErrors.name = newErrors.name[0];
      if (newErrors.description) newErrors.description = newErrors.description[0];
      if (newErrors.basePrice) newErrors.basePrice = newErrors.basePrice[0];
    }
    const totalRemainingImages = existingImages.length + selectedFiles.length;

    if (totalRemainingImages === 0) {
        newErrors.files = "Service must have at least one image.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formData = new FormData();
    formData.append("categoryId", categoryId);
    formData.append("name", name);
    formData.append("description", description);
    formData.append("basePrice", basePrice);
    formData.append("isActive", String(isActive));
    
    const validSpecs = specs.filter(s => s.title.trim() && s.value.trim());
    formData.append("specifications", JSON.stringify(validSpecs));
 
    selectedFiles.forEach(file => formData.append("images", file));
 
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
        {/* Responsive Width: 95% on mobile, max-2xl on desktop */}
        <div className="bg-white rounded-2xl shadow-2xl w-[95%] sm:w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="flex justify-between items-center px-4 sm:px-6 py-4 border-b border-gray-100 bg-gray-50 shrink-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate pr-4">
              {initialData ? "Edit Service" : "Add Service"}
            </h2>
            <button 
              onClick={onClose} 
              className="p-2 -mr-2 text-gray-400 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Body */}
          <div className="p-4 sm:p-6 space-y-6 overflow-y-auto scrollbar-thin">
            
            {/* Inputs Grid: 1 col on mobile, 2 cols on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Service Name</label>
                    <input 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      className={`w-full px-4 h-11 border rounded-xl outline-none text-sm sm:text-base ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'}`} 
                      placeholder="e.g. Split AC Installation" 
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                 </div>

                 <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                    <textarea 
                      value={description} 
                      onChange={e => setDescription(e.target.value)} 
                      rows={3} 
                      className={`w-full px-4 py-3 border rounded-xl resize-none outline-none text-sm sm:text-base ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'}`} 
                      placeholder="Describe the service..." 
                    />
                    {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                 </div>

                 <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Base Price (₹)</label>
                    <input 
                      type="number" 
                      value={basePrice} 
                      onChange={e => setBasePrice(e.target.value)} 
                      className={`w-full px-4 h-11 border rounded-xl outline-none text-sm sm:text-base ${errors.basePrice ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'}`} 
                      placeholder="0.00" 
                    />
                    {errors.basePrice && <p className="text-xs text-red-500 mt-1">{errors.basePrice}</p>}
                 </div>
            </div>

             {/* Active/Inactive Toggle */}
             <div className="flex items-center justify-between bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                      <Power size={18} className={isActive ? "text-green-600" : "text-gray-400"} />
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-gray-700">Service Status</span>
                        <span className="block text-xs text-gray-500">{isActive ? "Visible in App" : "Hidden"}</span>
                    </div>
                </div>
                <button 
                  onClick={() => setIsActive(!isActive)} 
                  className={`relative h-6 w-11 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                    <span className={`block h-4 w-4 bg-white rounded-full shadow transition-transform duration-200 ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
             </div>

            {/* Specifications */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Specifications</label>
              <div className="space-y-3 bg-gray-50 p-3 sm:p-4 rounded-xl border border-dashed border-gray-300">
                {specs.map((spec, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    {/* Stack inputs on mobile, row on desktop */}
                    <div className="flex-1 space-y-2 sm:space-y-0 sm:flex sm:gap-2">
                       <input 
                        placeholder="Title (e.g. Warranty)" 
                        value={spec.title} 
                        onChange={e => updateSpec(index, "title", e.target.value)} 
                        className="w-full sm:w-1/2 px-3 h-10 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" 
                      />
                       <input 
                        placeholder="Value (e.g. 30 Days)" 
                        value={spec.value} 
                        onChange={e => updateSpec(index, "value", e.target.value)} 
                        className="w-full sm:w-1/2 px-3 h-10 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500" 
                      />
                    </div>
                    {specs.length > 1 && (
                      <button 
                        onClick={() => removeSpecRow(index)} 
                        className="p-2 h-10 w-10 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={addSpecRow} className="flex items-center gap-2 text-sm text-blue-600 font-bold hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
                  <Plus size={16} /> 
                  <span>Add Specification</span>
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-2 gap-2">
                 <label className="block text-xs font-bold text-gray-700 uppercase">Images</label>
                 <span className="text-[10px] text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded w-fit">
                    <Info size={12} /> Max 5 files • JPG/PNG • &lt;5MB
                 </span>
              </div>
              
              {/* Responsive Grid: 3 cols mobile, 5 cols desktop */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                 <label className="flex flex-col items-center justify-center h-20 sm:h-24 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors active:scale-95">
                    <UploadCloud className="text-gray-400" size={24} />
                    <span className="text-[10px] font-bold text-gray-500 mt-1">Upload</span>
                    <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
                 </label>

                 {existingImages.map((url, idx) => (
                    <div key={`old-${idx}`} className="relative h-20 sm:h-24 rounded-xl overflow-hidden border border-gray-200 group">
                        <img src={url} className="w-full h-full object-cover opacity-90" alt="Existing" />
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.5">Existing</span>
                        <button 
                            type="button"
                            onClick={() => removeExistingImage(idx)} 
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                        >
                            <X size={12}/>
                        </button>
                    </div>
                 ))}

                 {newPreviews.map((url, idx) => (
                    <div key={`new-${idx}`} className="relative h-20 sm:h-24 rounded-xl overflow-hidden border border-blue-200 ring-2 ring-blue-500/20 group">
                        <img src={url} className="w-full h-full object-cover" alt="New" />
                        <button 
                            type="button"
                            onClick={() => removeNewFile(idx)} 
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                        >
                            <X size={12}/>
                        </button>
                    </div>
                 ))}
              </div>
              {errors.files && <p className="text-xs text-red-500 mt-2">{errors.files}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-gray-100 flex gap-3 shrink-0 bg-white">
             <button 
               onClick={onClose} 
               className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-transform"
             >
               Cancel
             </button>
             <button 
               onClick={handleSubmit} 
               disabled={isLoading} 
               className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-transform flex justify-center items-center gap-2 disabled:opacity-70 disabled:active:scale-100"
             >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {initialData ? "Update" : "Save"}
             </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceItemModal;