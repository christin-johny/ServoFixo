import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Upload, X, Check, Loader2, AlertCircle, 
  Layers,  ChevronDown, ChevronRight 
} from "lucide-react";

import Modal from "../../Shared/Modal/Modal";
import type { RootState } from "../../../../store/store";
import { addServiceRequest } from "../../../../store/technicianSlice";
import { 
  requestServiceAddition, 
  uploadDocument,
  type RequestServicePayload  
} from "../../../../infrastructure/repositories/technician/technicianProfileRepository";
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
  const [serviceMap, setServiceMap] = useState<Record<string, ServiceOption[]>>({});
  
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const [file, setFile] = useState<File | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [isUploading, setIsUploading] = useState(false); //   Added missing state

  //   Memoized removal tracking
  const pendingRemovalIds = useMemo(() => {
    return new Set(
      profile?.serviceRequests
        ?.filter(r => r.status === "PENDING" && r.action === "REMOVE")
        .map(r => r.serviceId) || []
    );
  }, [profile?.serviceRequests]);

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
  }, [isOpen, onClose, showError]);

  useEffect(() => {
    const fetchMissingServices = async () => {
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
        setExpandedCategories(prev => [...prev, ...missingIds]);
      } catch (err) {
        console.error("Service fetch error:", err);
      }
    };
    fetchMissingServices();
  }, [selectedCategoryIds, serviceMap]);

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
 

const handleRemoveRequest = async (serviceId: string, categoryId: string) => {
    if (isSubmitting) return;
    try {
        setIsSubmitting(true);
        
        //   Strictly typed payload
        const payload: RequestServicePayload = {
            serviceId,
            categoryId,
            proofUrl: "", // No proof needed for removal
            action: "REMOVE"
        };

        // Call repository (No more 'as any' needed if repository is updated)
        await requestServiceAddition(payload);

        //   Full optimistic object to satisfy Redux linting
        const reduxReq: ServiceRequest = {
            id: `rem-${Date.now()}`,
            serviceId: payload.serviceId,
            categoryId: payload.categoryId,
            action: "REMOVE",
            proofUrl: "",
            status: "PENDING",
            requestedAt: new Date().toISOString(),
            isDismissed: false,
            isArchived: false
        };

        dispatch(addServiceRequest(reduxReq));
        showSuccess("Removal request submitted.");
        handleClose();
    } catch (error) {
        console.error("Removal Error:", error);
        showError("Failed to submit removal request.");
    } finally {
        setIsSubmitting(false);
    }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServiceIds.length === 0 || !file) {
      showError("Please select at least one service and upload proof.");
      return;
    }

    try {
      setIsSubmitting(true);
      //setIsUploading(true);
      const proofUrl = await uploadDocument(file, "documents");
      //setIsUploading(false);

      const promises = selectedServiceIds.map(async (serviceId) => {
        let categoryId = "";
        for (const [catId, services] of Object.entries(serviceMap)) {
          if (services.some(s => s.id === serviceId)) {
            categoryId = catId;
            break;
          }
        }

        const payload: RequestServicePayload = { serviceId, categoryId, proofUrl, action: "ADD" };
        await requestServiceAddition(payload);

        return {
          id: `add-${Date.now()}-${serviceId}`,
          serviceId,
          categoryId,
          action: "ADD",
          proofUrl,
          status: "PENDING",
          requestedAt: new Date().toISOString(),
          isDismissed: false,
          isArchived: false
        } as ServiceRequest;
      });

      const newRequests = await Promise.all(promises);
      newRequests.forEach(req => dispatch(addServiceRequest(req)));
      
      showSuccess(`Submitted ${newRequests.length} additions.`);
      handleClose();
    } catch   {
      showError("Submission failed.");
    } finally {
      setIsSubmitting(false);
      //setIsUploading(false);
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Modify Services" maxWidth="max-w-3xl">
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start text-xs text-blue-700 border border-blue-100">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>Request new services (proof required) or remove active ones. Verification takes 24-48 hours.</p>
        </div>

        {loadingData ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-gray-300" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/*   Removal Section */}
            {profile?.subServices && profile.subServices.length > 0 && (
              <div className="space-y-3 pb-4 border-b border-gray-100">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-2 text-red-600 uppercase">
                  <X className="w-4 h-4" /> Current Skills (Request Removal)
                </label>
                <div className="flex flex-wrap gap-2">
                  {profile.subServices.map(s => {
                    const isPendingRemoval = pendingRemovalIds.has(s.id);
                    return (
                      <div key={s.id} className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 ${
                        isPendingRemoval ? 'bg-red-50 text-red-400 border-red-100' : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {s.name}
                        {!isPendingRemoval && (
                          <button type="button" onClick={() => handleRemoveRequest(s.id, s.categoryId)} className="hover:text-red-600 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selection UI */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-2 uppercase">
                <Layers className="w-4 h-4 text-blue-600" /> 1. Select Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button key={cat.id} type="button" onClick={() => handleCategoryToggle(cat.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
                      selectedCategoryIds.includes(cat.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'
                    }`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Service Selection */}
            {selectedCategoryIds.length > 0 && (
              <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 bg-white">
                {selectedCategoryIds.map(catId => {
                  const categoryName = categories.find(c => c.id === catId)?.name || 'Unknown';
                  const isExpanded = expandedCategories.includes(catId);
                  const validServices = (serviceMap[catId] || []).filter(s => !isServiceAlreadyActiveOrPending(s.id));

                  return (
                    <div key={catId}>
                      <button type="button" onClick={() => setExpandedCategories(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId])}
                        className="w-full flex items-center justify-between px-5 py-3 bg-gray-50/50 hover:bg-gray-100">
                        <span className="text-xs font-bold text-gray-700">{categoryName}</span>
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      {isExpanded && (
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {validServices.map(svc => (
                            <label key={svc.id} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100 cursor-pointer">
                              <input type="checkbox" checked={selectedServiceIds.includes(svc.id)} onChange={() => handleServiceToggle(svc.id)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                              <span className="text-xs font-medium text-gray-700">{svc.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center relative hover:bg-gray-50 transition-colors">
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-xs bg-green-50 py-2 px-4 rounded-lg">
                  <Check className="w-4 h-4" /> {file.name}
                  <button type="button" onClick={(e) => { e.preventDefault(); setFile(null); }} className="p-1 hover:bg-green-100 rounded-full z-10"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400"><Upload className="w-5 h-5" /><p className="text-xs">Click to upload certification proof</p></div>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={handleClose} className="flex-1 py-3 text-xs font-bold text-gray-500 bg-gray-100 rounded-xl">Cancel</button>
              <button type="submit" disabled={isSubmitting || selectedServiceIds.length === 0 || !file}
                className="flex-1 py-3 text-xs font-bold text-white bg-blue-600 rounded-xl disabled:opacity-50 flex justify-center items-center gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : `Submit Addition (${selectedServiceIds.length})`}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

export default ServiceRequestModal;