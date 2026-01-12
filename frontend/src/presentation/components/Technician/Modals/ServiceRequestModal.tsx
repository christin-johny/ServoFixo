import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Upload, X, Check, Loader2, AlertCircle, 
  Layers, Wrench, ChevronDown, ChevronRight 
} from "lucide-react";

import Modal from "../../Shared/Modal/Modal";
import type { RootState } from "../../../../store/store";
import { addServiceRequest } from "../../../../store/technicianSlice";
import { requestServiceAddition, uploadDocument } from "../../../../infrastructure/repositories/technician/technicianProfileRepository";
import { technicianOnboardingRepository, type CategoryOption, type ServiceOption } from "../../../../infrastructure/repositories/technician/technicianOnboardingRepository";
import { type ServiceRequest } from "../../../../domain/types/TechnicianRequestTypes";
import { useNotification } from "../../../hooks/useNotification";

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state: RootState) => state.technician);
  const { showSuccess, showError } = useNotification();

  // --- State ---
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  
  // Storage for services fetched by category { [catId]: services[] }
  const [serviceMap, setServiceMap] = useState<Record<string, ServiceOption[]>>({});
  
  // Selections
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const [file, setFile] = useState<File | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 1. Fetch Categories on Open ---
  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        setLoadingData(true);
        try {
          const cats = await technicianOnboardingRepository.getCategories();
          setCategories(cats);
        } catch {
          showError("Failed to load categories.");
          onClose();
        } finally {
          setLoadingData(false);
        }
      };
      fetchCategories();
    }
  }, [isOpen]);

  // --- 2. Fetch Services when a Category is Selected ---
  useEffect(() => {
    const fetchMissingServices = async () => {
      // Identify categories that are selected but data is not yet loaded
      const missingIds = selectedCategoryIds.filter(id => !serviceMap[id]);
      if (missingIds.length === 0) return;

      try {
        const promises = missingIds.map(id => 
          technicianOnboardingRepository.getServicesByCategory(id).then(res => ({ id, data: res }))
        );
        
        const results = await Promise.all(promises);
        
        setServiceMap(prev => {
          const next = { ...prev };
          results.forEach(r => { next[r.id] = r.data; });
          return next;
        });

        // Auto-expand the newly selected categories
        setExpandedCategories(prev => [...prev, ...missingIds]);

      } catch (err) {
        console.error(err);
      }
    };

    fetchMissingServices();
  }, [selectedCategoryIds]);

  // --- Helpers ---
  const isServiceAlreadyActiveOrPending = (serviceId: string) => {
    const hasSkill = profile?.subServiceIds.includes(serviceId);
    const hasPending = profile?.serviceRequests.some(
      req => req.serviceId === serviceId && req.status === "PENDING"
    );
    return hasSkill || hasPending;
  };

  const handleCategoryToggle = (catId: string) => {
    setSelectedCategoryIds(prev => {
      const exists = prev.includes(catId);
      if (exists) {
        // If removing category, also remove its selected services
        const catServices = serviceMap[catId]?.map(s => s.id) || [];
        setSelectedServiceIds(current => current.filter(id => !catServices.includes(id)));
        return prev.filter(id => id !== catId);
      }
      return [...prev, catId];
    });
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServiceIds(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId) 
        : [...prev, serviceId]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 5 * 1024 * 1024) {
        showError("File size must be less than 5MB");
        return;
      }
      setFile(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServiceIds.length === 0 || !file) {
      showError("Please select at least one service and upload a certificate.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Step A: Upload File (Once for the batch)
      setIsUploading(true);
      const proofUrl = await uploadDocument(file, "documents");
      setIsUploading(false);

      // Step B: Submit Requests in Batch
      const promises = selectedServiceIds.map(async (serviceId) => {
        // Find category ID for this service
        let categoryId = "";
        for (const [catId, services] of Object.entries(serviceMap)) {
          if (services.some(s => s.id === serviceId)) {
            categoryId = catId;
            break;
          }
        }

        const payload = { serviceId, categoryId, proofUrl };
        
        // 1. Backend Call
        await requestServiceAddition(payload);

        // 2. Redux Optimistic Update Object
        return {
          serviceId,
          categoryId,
          action: "ADD",
          proofUrl,
          status: "PENDING",
          requestedAt: new Date().toISOString()
        } as ServiceRequest;
      });

      const newRequests = await Promise.all(promises);

      // Step C: Update Redux
      newRequests.forEach(req => dispatch(addServiceRequest(req)));
      
      showSuccess(`Successfully requested ${newRequests.length} new skill(s).`);
      handleClose();

    } catch (err) {
      console.error(err);
      showError("Failed to submit one or more requests.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedCategoryIds([]);
    setSelectedServiceIds([]);
    setExpandedCategories([]);
    setFile(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Request New Competencies" maxWidth="max-w-3xl">
      <div className="space-y-6">
        
        {/* Info Banner */}
        <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start text-sm text-blue-700 border border-blue-100">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p>
            You can add multiple skills in one request. Please ensure the uploaded 
            certificate acts as valid proof for <strong>ALL</strong> selected services.
          </p>
        </div>

        {loadingData ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. SELECT CATEGORIES */}
            <div className="space-y-3">
               <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                 <Layers className="w-4 h-4 text-blue-600"/> 
                 1. Select Categories
               </label>
               <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                      <button 
                        type="button" 
                        key={cat.id} 
                        onClick={() => handleCategoryToggle(cat.id)}
                        className={`
                          px-4 py-2 rounded-lg text-sm font-medium border transition-all
                          ${selectedCategoryIds.includes(cat.id) 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                        `}
                      >
                        {cat.name}
                      </button>
                  ))}
               </div>
            </div>

            {/* 2. SELECT SERVICES (Accordion) */}
            {selectedCategoryIds.length > 0 && (
               <div className="space-y-3 pt-2 animate-fade-in">
                 <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                   <Wrench className="w-4 h-4 text-blue-600"/> 
                   2. Select Services
                 </label>
                 
                 <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 bg-white">
                    {selectedCategoryIds.map(catId => {
                       const categoryName = categories.find(c => c.id === catId)?.name || 'Unknown';
                       const services = serviceMap[catId] || [];
                       const isExpanded = expandedCategories.includes(catId);
                       
                       // Filter out active/pending services
                       const validServices = services.filter(s => !isServiceAlreadyActiveOrPending(s.id));
                       
                       return (
                         <div key={catId} className="bg-white">
                            <button 
                              type="button" 
                              onClick={() => setExpandedCategories(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId])}
                              className="w-full flex items-center justify-between px-5 py-4 bg-gray-50/50 hover:bg-gray-100 transition-colors"
                            >
                               <span className="text-sm font-bold text-gray-700">{categoryName}</span>
                               {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400"/> : <ChevronRight className="w-5 h-5 text-gray-400"/>}
                            </button>
                            
                            {isExpanded && (
                               <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                                  {services.length === 0 ? (
                                    <p className="text-sm text-gray-400 col-span-2 italic flex items-center gap-2">
                                      <Loader2 className="w-3 h-3 animate-spin"/> Loading services...
                                    </p>
                                  ) : validServices.length === 0 ? (
                                    <p className="text-sm text-green-600 col-span-2 font-medium">
                                      All services in this category are already active or pending.
                                    </p>
                                  ) : (
                                    validServices.map(svc => (
                                        <label 
                                          key={svc.id} 
                                          className={`
                                            flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                            ${selectedServiceIds.includes(svc.id) 
                                              ? 'bg-blue-50 border-blue-200 shadow-sm' 
                                              : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}
                                          `}
                                        >
                                           <input 
                                             type="checkbox" 
                                             checked={selectedServiceIds.includes(svc.id)} 
                                             onChange={() => handleServiceToggle(svc.id)}
                                             className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                           />
                                           <span className={`text-sm font-medium ${selectedServiceIds.includes(svc.id) ? 'text-blue-800' : 'text-gray-700'}`}>
                                             {svc.name}
                                           </span>
                                        </label>
                                    ))
                                  )}
                               </div>
                            )}
                         </div>
                       );
                    })}
                 </div>
               </div>
            )}

            {/* 3. PROOF UPLOAD */}
            <div className="space-y-3 pt-2">
              <label className="text-sm font-bold text-gray-700">3. Proof of Competency</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                <input 
                  type="file" 
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {file ? (
                  <div className="flex items-center justify-center gap-2 text-green-600 font-medium bg-green-50 py-2 px-4 rounded-lg inline-flex">
                    <Check className="w-5 h-5" />
                    <span className="truncate max-w-[200px]">{file.name}</span>
                    <button 
                      type="button"
                      onClick={(e) => { e.preventDefault(); setFile(null); }}
                      className="p-1 hover:bg-green-100 rounded-full z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <div className="p-3 bg-gray-100 rounded-full">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs">
                      <span className="font-bold text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-[10px] text-gray-400">PDF, JPG or PNG (Max 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedServiceIds.length === 0 || !file}
                className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-blue-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {isUploading ? "Uploading..." : "Processing..."}
                  </>
                ) : (
                  `Submit ${selectedServiceIds.length > 0 ? `(${selectedServiceIds.length})` : ""} Requests`
                )}
              </button>
            </div>

          </form>
        )}
      </div>
    </Modal>
  );
};

export default ServiceRequestModal;