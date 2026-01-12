import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  ArrowRight, ArrowLeft, Loader2,  
  MapPin, Navigation, Save, Map as MapIcon
} from "lucide-react";
import type { AppDispatch, RootState } from "../../../../../store/store";
import { technicianOnboardingRepository } from "../../../../../infrastructure/repositories/technician/technicianOnboardingRepository";
import { updateZones, setOnboardingStep } from "../../../../../store/technicianSlice"; 
import { useNotification } from "../../../../hooks/useNotification";
import TechnicianZoneSelectMap from "../Maps/TechnicianZoneSelectMap";
 
import { 
  step3Schema, 
  processRawZones,      
  findNearestCity,      
  calculateDistance, 
  sortCitiesByLocation,
  type ProcessedZone,  
  type GeoCoordinate,
  type ZoneOption
} from "./step3.config";

interface Step3Props {
  onNext: () => void;
  onBack: () => void;
  onSaveAndExit: () => void;
}

const Step3_Zones: React.FC<Step3Props> = ({ onNext, onBack, onSaveAndExit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.technician);
  const { showSuccess, showError } = useNotification();

  // --- STATE ---
  const [zones, setZones] = useState<ProcessedZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [userLocation, setUserLocation] = useState<GeoCoordinate | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>("");

  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>(
    profile?.zoneIds || []
  );

  const isRejected = profile?.verificationStatus === "REJECTED";

  // --- 1. FETCH ZONES ---
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const rawData = await technicianOnboardingRepository.getZones() as unknown as ZoneOption[];
        
        // ✅ CLEANER: Logic moved to config
        const processed = processRawZones(rawData);
        setZones(processed);

        // Pre-select city
        if (profile?.zoneIds && profile.zoneIds.length > 0) {
            const firstSelected = processed.find(z => z.id === profile.zoneIds[0]);
            if (firstSelected) setSelectedCity(firstSelected.normalizedCity);
        }
      } catch (error) {
        console.error(error);
        showError("Failed to load service zones.");
      } finally {
        setLoading(false);
      }
    };
    fetchZones();
  }, []);

  // --- 2. LOCATION HANDLER ---
  const detectLocation = () => {
    if (!navigator.geolocation) {
      showError("Geolocation is not supported.");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        setUserLocation({ lat, lng });

        // ✅ CLEANER: Logic moved to config
        const nearestCity = findNearestCity(zones, lat, lng);

        if (nearestCity && nearestCity !== selectedCity) {
            setSelectedCity(nearestCity); // Force Switch
            showSuccess(`Switched to nearest city: ${nearestCity}`);
        } else {
            showSuccess("You are already viewing the nearest city.");
        }
        setLocationLoading(false);
      },
      (error) => {
        console.error(error);
        showError("Unable to retrieve location.");
        setLocationLoading(false);
      }
    );
  };

  // --- 3. COMPUTED LISTS ---
  const uniqueCities = useMemo(() => {
    const cities = Array.from(new Set(zones.map(z => z.normalizedCity))).filter(Boolean);
    return userLocation ? sortCitiesByLocation(cities, zones, userLocation) : cities.sort();
  }, [zones, userLocation]);

  const visibleZones = useMemo(() => {
    if (!selectedCity) return [];
    let cityZones = zones.filter(z => z.normalizedCity === selectedCity);

    if (userLocation) {
      cityZones = cityZones.sort((a, b) => {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.center.lat, a.center.lng);
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.center.lat, b.center.lng);
        return distA - distB;
      });
    }
    return cityZones;
  }, [zones, selectedCity, userLocation]);

  // --- HANDLERS ---

  const handleCityChange = (newCity: string) => {
    if (selectedZoneIds.length > 0 && newCity !== selectedCity) setSelectedZoneIds([]); 
    setSelectedCity(newCity);
  };

  const selectZone = (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;

    if (selectedCity && zone.normalizedCity !== selectedCity) {
        showError(`Please switch to ${zone.normalizedCity} first.`);
        return;
    }
    if (!selectedCity) setSelectedCity(zone.normalizedCity);

    setSelectedZoneIds((prev) => prev.includes(zoneId) ? [] : [zoneId]);
  };

  const validateAndSave = async () => {
    const result = step3Schema.safeParse({ zoneIds: selectedZoneIds });
    if (!result.success) {
      showError(result.error.errors[0].message);
      return false;
    }

    try {
      setIsSaving(true);
      const payload = { zoneIds: selectedZoneIds };
      await technicianOnboardingRepository.updateStep3(payload);
      dispatch(updateZones(selectedZoneIds));
      return true;
    } catch {
      showError("Failed to save zone.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextClick = async () => {
    if (await validateAndSave()) {
      if (!isRejected) dispatch(setOnboardingStep(4));
      showSuccess("Service zone saved!");
      onNext();
    }
  };

  const handleSaveExitClick = async () => {
    if (await validateAndSave()) {
      showSuccess("Progress saved.");
      onSaveAndExit();
    }
  };

  if (loading) return <div className="flex h-60 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
           <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Select Primary Zone <span className="text-red-500">*</span>
          </h3>
          <p className="text-sm text-gray-500">Choose the one main area where you will start your day.</p>
        </div>
        
        <button onClick={detectLocation} disabled={locationLoading} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-bold rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 border border-blue-100">
          {locationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
          {userLocation ? "Nearest City Found" : "Detect My Location"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[550px]">
        {/* LEFT PANEL */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
            {/* City Filter */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">1. Select City</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select value={selectedCity} onChange={(e) => handleCityChange(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                        <option value="" disabled>-- Choose a City --</option>
                        {uniqueCities.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                </div>
            </div>

            {/* Zone List */}
            <div className="flex-1 flex flex-col min-h-0 bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-500 uppercase">2. Select Zone</label>
                    {userLocation && selectedCity && <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Nearest First</span>}
                </div>

                {!selectedCity ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-center p-6">
                        <MapIcon className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-sm">Please select a city above</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-2">
                        {visibleZones.map((zone) => {
                            const isSelected = selectedZoneIds.includes(zone.id);
                            const distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, zone.center.lat, zone.center.lng).toFixed(1) : null;
                            return (
                                <div key={zone.id} onClick={() => selectZone(zone.id)} className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${isSelected ? "border-blue-600 bg-blue-50 shadow-sm" : "border-gray-100 bg-white hover:border-blue-200"}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className={`font-bold text-sm ${isSelected ? "text-blue-800" : "text-gray-800"}`}>{zone.name}</h4>
                                            {distance && <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-1"><Navigation className="w-3 h-3" /> {distance} km away</span>}
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT PANEL: Map */}
        <div className="hidden lg:block w-2/3 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
          <TechnicianZoneSelectMap zones={selectedCity ? visibleZones : []} selectedZoneIds={selectedZoneIds} onZoneClick={selectZone} />
          {!selectedCity && (
              <div className="absolute inset-0 bg-gray-50/50 backdrop-blur-[2px] flex items-center justify-center z-10">
                  <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-gray-100 text-center">
                      <p className="font-bold text-gray-600">Select a City</p>
                      <p className="text-xs text-gray-400">to view primary zones</p>
                  </div>
              </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-6 border-t border-gray-100">
        <button onClick={onBack} disabled={isSaving} className="flex items-center justify-center gap-2 px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"><ArrowLeft className="w-5 h-5" /> Back</button>
        <div className="flex flex-col-reverse sm:flex-row gap-3">
            {!isRejected && <button onClick={handleSaveExitClick} disabled={isSaving} className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-50"><Save className="w-5 h-5" /> Save & Exit</button>}
            <button onClick={handleNextClick} disabled={isSaving || selectedZoneIds.length === 0} className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20">
              {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <>Next Step <ArrowRight className="w-5 h-5" /></>}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Step3_Zones;