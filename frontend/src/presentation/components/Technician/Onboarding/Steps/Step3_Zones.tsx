import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import type { AppDispatch, RootState } from "../../../../../store/store";
import { technicianOnboardingRepository, type ZoneOption } from "../../../../../infrastructure/repositories/technician/technicianOnboardingRepository";
import { updateZones, setOnboardingStep } from "../../../../../store/technicianSlice"; 
import { useNotification } from "../../../../hooks/useNotification";
import TechnicianZoneSelectMap from "../maps/TechnicianZoneSelectMap";

interface Step3Props {
  onNext: () => void;
  onBack: () => void;
}

const Step3_Zones: React.FC<Step3Props> = ({ onNext, onBack }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.technician);
  const { showSuccess, showError } = useNotification();

  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
 
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>(
    profile?.zoneIds || [] 
  );

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const data = await technicianOnboardingRepository.getZones();
        setZones(data);
      } catch (error) {
        console.error(error);
        showError("Failed to load service zones.");
      } finally {
        setLoading(false);
      }
    };
    fetchZones();
  }, []);

  const toggleZone = (zoneId: string) => {
    setSelectedZoneIds((prev) =>
      prev.includes(zoneId) ? prev.filter((id) => id !== zoneId) : [...prev, zoneId]
    );
  };

  const handleNext = async () => {
    if (selectedZoneIds.length === 0) {
      showError("Please select at least one service zone.");
      return;
    }

    try {
      setIsSaving(true);
       
      const apiPayload = { zoneIds: selectedZoneIds };
      await technicianOnboardingRepository.updateStep3(apiPayload);
 
      dispatch(updateZones(selectedZoneIds));
      dispatch(setOnboardingStep(4));

      showSuccess("Zones saved successfully!");
      onNext();
    } catch {
      showError("Failed to save zones.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          Select Service Zones <span className="text-red-500">*</span>
        </h3>
        <p className="text-sm text-gray-500">
          Tap the zones on the list or map to select where you can work.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[500px]">
        {/* Left: Scrollable List */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
          {zones.map((zone) => {
            const isSelected = selectedZoneIds.includes(zone.id);
            const isInactive = !zone.isActive;
            return (
              <div
                key={zone.id}
                onClick={() => toggleZone(zone.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-blue-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className={`font-bold text-sm ${isSelected ? "text-blue-800" : "text-gray-800"}`}>
                      {zone.name}
                    </h4>
                    {isInactive && (
                      <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium inline-block mt-1">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Map Visualization */}
        <div className="w-full lg:w-2/3 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
          <TechnicianZoneSelectMap
            zones={zones}
            selectedZoneIds={selectedZoneIds}
            onZoneClick={toggleZone}
          />
          {/* Legend Overlay */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-md text-xs space-y-2 z-[400] border border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-600 rounded-sm opacity-60"></span> 
              <span className="font-medium text-gray-700">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-sm opacity-30"></span> 
              <span className="font-medium text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-gray-400 rounded-sm opacity-30"></span> 
              <span className="font-medium text-gray-700">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
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
          disabled={isSaving || selectedZoneIds.length === 0}
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

export default Step3_Zones;