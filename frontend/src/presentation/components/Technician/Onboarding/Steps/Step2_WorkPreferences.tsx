import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import type { AppDispatch, RootState } from "../../../../../store/store";
import { 
  technicianOnboardingRepository, 
} from "../../../../../infrastructure/repositories/technician/technicianOnboardingRepository";
import { updateWorkPreferences, setOnboardingStep } from "../../../../../store/technicianSlice";
import { useNotification } from "../../../../hooks/useNotification";

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
}

interface BaseItem {
  id?: string;
  _id?: string;
  name: string;
}

interface RuntimeCategoryOption extends BaseItem {
  imageUrl?: string;
  iconUrl?: string;
}

interface RuntimeServiceOption extends BaseItem {
  categoryId?: string | BaseItem; 
  category?: string | BaseItem;
}

const Step2_WorkPreferences: React.FC<Step2Props> = ({ onNext, onBack }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.technician);
  const { showSuccess, showError } = useNotification();
 
  const [categories, setCategories] = useState<RuntimeCategoryOption[]>([]);
  const [services, setServices] = useState<RuntimeServiceOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);
 
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    profile?.categoryIds || []
  );
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    profile?.subServiceIds || []
  );

  const [isSaving, setIsSaving] = useState(false);

  const getId = (item: BaseItem | string | undefined): string => {
    if (!item) return "";
    if (typeof item === 'string') return item;
    return item.id || item._id || "";
  };

  const getServiceCategoryId = (service: RuntimeServiceOption): string => {
    if (service.categoryId) {
      return getId(service.categoryId);
    }
    if (service.category) {
      return getId(service.category);
    }
    return "";
  };
 
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await technicianOnboardingRepository.getCategories();
        setCategories(data as unknown as RuntimeCategoryOption[]);
      } catch (err) {
        console.error(err);
        showError("Failed to load categories");
      } finally {
        setLoadingData(false);
      }
    };
    loadCategories();
  }, []);
 
  useEffect(() => {
    const loadServices = async () => {
      if (selectedCategoryIds.length === 0) {
        setServices([]);
        return;
      }

      try {
        const promises = selectedCategoryIds.map(id => 
          technicianOnboardingRepository.getServicesByCategory(id)
        );
        const results = await Promise.all(promises);
        const allServices = results.flat() as unknown as RuntimeServiceOption[];
        
        const uniqueServicesMap = new Map<string, RuntimeServiceOption>();
        allServices.forEach(s => {
          const id = getId(s);
          if (id) uniqueServicesMap.set(id, s);
        });
        
        setServices(Array.from(uniqueServicesMap.values()));
      } catch (err) {
        console.error(err);
      }
    };

    loadServices();
  }, [selectedCategoryIds]);
 

  const toggleCategory = (catId: string) => {
    const isSelected = selectedCategoryIds.includes(catId);

    if (isSelected) {
      const servicesToRemove = services.filter(s => getServiceCategoryId(s) === catId);
      const serviceIdsToRemove = servicesToRemove.map(s => getId(s));

      setSelectedServiceIds(prev => 
        prev.filter(sId => !serviceIdsToRemove.includes(sId))
      );
      setSelectedCategoryIds(prev => prev.filter(c => c !== catId));
    } else {
      setSelectedCategoryIds(prev => [...prev, catId]);
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds(prev => 
      prev.includes(serviceId) ? prev.filter(s => s !== serviceId) : [...prev, serviceId]
    );
  };

  const handleNext = async () => {
    const validServiceIds = selectedServiceIds.filter(selectedId => 
      services.some(s => getId(s) === selectedId)
    );

    if (selectedCategoryIds.length === 0) {
      showError("Please select at least one category.");
      return;
    }
    
    if (validServiceIds.length === 0) {
      showError("Please select at least one service.");
      return;
    }

    try {
      setIsSaving(true);
      
      const payload = {
        categoryIds: selectedCategoryIds,
        subServiceIds: validServiceIds
      };

      await technicianOnboardingRepository.updateStep2(payload);
 
      setSelectedServiceIds(validServiceIds);
      dispatch(updateWorkPreferences(payload));
      dispatch(setOnboardingStep(3));

      showSuccess("Preferences saved!");
      onNext();
    } catch {
      showError("Failed to save preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* SECTION 1: Categories */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          1. Select Your Trade <span className="text-red-500">*</span>
          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Multi-select allowed
          </span>
        </h3>
        
        {categories.length === 0 ? (
           <p className="text-gray-500 text-sm">No categories found. Please contact support.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const catId = getId(cat);
              const isSelected = selectedCategoryIds.includes(catId);
              
              return (
                <div
                  key={catId}
                  onClick={() => toggleCategory(catId)}
                  className={`cursor-pointer group relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 shadow-sm"
                      : "border-gray-100 bg-white hover:border-blue-200 hover:shadow-md"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 text-blue-600">
                      <CheckCircle2 className="w-5 h-5 fill-blue-100" />
                    </div>
                  )}
                  
                  <div className="w-12 h-12 mb-3 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden p-2">
                    <img src={cat.imageUrl || cat.iconUrl} alt={cat.name} className="w-full h-full object-contain" />
                  </div>
                  
                  <span className={`font-semibold text-sm text-center ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                    {cat.name}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Services */}
      {selectedCategoryIds.length > 0 && (
        <div className="animate-fade-in-up">
          <div className="h-px bg-gray-100 my-6" />
          
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            2. Select Specific Services <span className="text-red-500">*</span>
          </h3>

          {services.length === 0 ? (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-100">
               <Loader2 className="w-4 h-4 animate-spin" />
               <span className="text-sm font-medium">Fetching available services...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {services.map((service) => {
                 const serviceId = getId(service);
                 const isSelected = selectedServiceIds.includes(serviceId);
                 
                 return (
                   <div 
                     key={serviceId}
                     onClick={() => toggleService(serviceId)}
                     className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? "bg-blue-50 border-blue-500 shadow-sm" 
                          : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                     }`}
                   >
                     <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isSelected ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
                     }`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                     </div>
                     <div>
                       <p className={`text-sm font-medium ${isSelected ? "text-blue-900" : "text-gray-700"}`}>
                         {service.name}
                       </p>
                     </div>
                   </div>
                 );
              })}
            </div>
          )}
        </div>
      )}

      {/* Warning */}
      {selectedCategoryIds.length === 0 && (
        <div className="flex items-center gap-2 text-gray-400 bg-gray-50 p-4 rounded-lg border border-dashed border-gray-200">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">Select a category above to view available services.</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t border-gray-100">
        <button
          onClick={onBack}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <button
          onClick={handleNext}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Saving...
            </>
          ) : (
            <>
              Next Step <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Step2_WorkPreferences;