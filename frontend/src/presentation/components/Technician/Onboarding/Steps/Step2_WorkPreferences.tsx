import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight, ArrowLeft, CheckCircle2, Loader2,
  AlertCircle, Search, Save
} from "lucide-react";
import type { AppDispatch, RootState } from "../../../../../store/store";
import {
  technicianOnboardingRepository,
} from "../../../../../infrastructure/repositories/technician/technicianOnboardingRepository";
import { updateWorkPreferences, setOnboardingStep } from "../../../../../store/technicianSlice";
import { useNotification } from "../../../../hooks/useNotification";

import {
  step2Schema,
  getId,
  getServiceCategoryId,
  type RuntimeCategoryOption,
  type RuntimeServiceOption
} from "./step2.config";

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
  onSaveAndExit: () => void;
}

const Step2_WorkPreferences: React.FC<Step2Props> = ({ onNext, onBack, onSaveAndExit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.technician);
  const { showSuccess, showError } = useNotification();

  const [categories, setCategories] = useState<RuntimeCategoryOption[]>([]);
  const [services, setServices] = useState<RuntimeServiceOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingServices, setLoadingServices] = useState(false);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    profile?.categoryIds || []
  );
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    profile?.subServiceIds || []
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isRejected = profile?.verificationStatus === "REJECTED";

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

      setLoadingServices(true);
      try {
        const promises = selectedCategoryIds.map(id =>
          technicianOnboardingRepository.getServicesByCategory(id)
        );
        const results = await Promise.all(promises);

        const allServices: RuntimeServiceOption[] = [];

        results.forEach((catServices, index) => {
          const sourceCatId = selectedCategoryIds[index];
          const tagged = (catServices as unknown as RuntimeServiceOption[]).map(s => ({
            ...s,
            _sourceCategoryId: sourceCatId
          }));
          allServices.push(...tagged);
        });

        const uniqueServicesMap = new Map<string, RuntimeServiceOption>();
        allServices.forEach(s => {
          const id = getId(s);
          if (id) uniqueServicesMap.set(id, s);
        });

        setServices(Array.from(uniqueServicesMap.values()));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, [selectedCategoryIds]);


  const toggleCategory = (catId: string) => {
    const isSelected = selectedCategoryIds.includes(catId);

    if (isSelected) {
      const servicesToRemove = services.filter(s => getServiceCategoryId(s) === catId);
      const serviceIdsToRemove = servicesToRemove.map(s => getId(s));

      setSelectedServiceIds(prev => prev.filter(sId => !serviceIdsToRemove.includes(sId)));
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


  const validateAndSave = async () => {
    const validation = step2Schema.safeParse({
      categoryIds: selectedCategoryIds,
      subServiceIds: selectedServiceIds
    });

    if (!validation.success) {
      showError(validation.error.errors[0].message);
      return false;
    }

    for (const catId of selectedCategoryIds) {
      const servicesInThisCat = services.filter(s => getServiceCategoryId(s) === catId);

      if (servicesInThisCat.length === 0) continue;

      const hasSelection = servicesInThisCat.some(s => selectedServiceIds.includes(getId(s)));

      if (!hasSelection) {
        const catName = categories.find(c => getId(c) === catId)?.name || "Unknown Category";
        showError(`You selected "${catName}" but didn't pick any services. Please select services or uncheck the category.`);
        return false;
      }
    }

    try {
      setIsSaving(true);

      const validServiceIds = selectedServiceIds.filter(selectedId =>
        services.some(s => getId(s) === selectedId)
      );

      const payload = {
        categoryIds: selectedCategoryIds,
        subServiceIds: validServiceIds
      };

      await technicianOnboardingRepository.updateStep2(payload);

      setSelectedServiceIds(validServiceIds);
      dispatch(updateWorkPreferences(payload));

      return true;
    } catch {
      showError("Failed to save preferences.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextClick = async () => {
    if (await validateAndSave()) {
      if (!isRejected) dispatch(setOnboardingStep(3));
      showSuccess("Work preferences saved!");
      onNext();
    }
  };

  const handleSaveExitClick = async () => {
    if (await validateAndSave()) {
      showSuccess("Progress saved.");
      onSaveAndExit();
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingData) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isActionDisabled = isSaving || loadingServices;

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const catId = getId(cat);
            const isSelected = selectedCategoryIds.includes(catId);

            return (
              <div
                key={catId}
                onClick={() => toggleCategory(catId)}
                className={`cursor-pointer group relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${isSelected
                    ? "border-blue-600 bg-blue-50/50 shadow-sm"
                    : "border-gray-100 bg-white hover:border-blue-200 hover:shadow-md"
                  }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 text-blue-600">
                    <CheckCircle2 className="w-5 h-5 fill-blue-100" />
                  </div>
                )}

                <div className={`w-12 h-12 mb-3 rounded-full shadow-sm flex items-center justify-center overflow-hidden p-2 transition-colors ${isSelected ? "bg-white" : "bg-gray-50"
                  }`}>
                  <img src={cat.imageUrl || cat.iconUrl} alt={cat.name} className="w-full h-full object-contain" />
                </div>

                <span className={`font-semibold text-sm text-center ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {selectedCategoryIds.length > 0 && (
        <div className="animate-fade-in-up">
          <div className="h-px bg-gray-100 my-6" />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                2. Select Specific Services <span className="text-red-500">*</span>
              </h3>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {loadingServices ? (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-100">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Fetching available services...</span>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
              {searchTerm ? "No services match your search." : "No services available for selected categories."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredServices.map((service) => {
                const serviceId = getId(service);
                const isSelected = selectedServiceIds.includes(serviceId);

                return (
                  <div
                    key={serviceId}
                    onClick={() => toggleService(serviceId)}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected
                        ? "bg-blue-50 border-blue-500 shadow-sm"
                        : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${isSelected ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
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
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-6 border-t border-gray-100">
        <button
          onClick={onBack}
          disabled={isActionDisabled}
          className="flex items-center justify-center gap-2 px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          {!isRejected && (
            <button
              onClick={handleSaveExitClick}
              disabled={isActionDisabled}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" /> Save & Exit
            </button>
          )}

          <button
            onClick={handleNextClick}
            disabled={isActionDisabled}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
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
    </div>
  );
};

export default Step2_WorkPreferences;