import React, { useState, useEffect } from "react";
import { Search, X, Check, Truck, Ban, Wifi, WifiOff } from "lucide-react";
import { 
  searchTechnicians, 
  type TechnicianSearchResult 
} from "../../../../infrastructure/repositories/admin/adminBookingRepository"; 
import { useDebounce } from "../../../hooks/useDebounce";

interface ForceAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (techId: string) => Promise<void>;
  // ✅ New Context Prop
  context: {
      zoneId: string;
      serviceId: string;
  };
}

const ForceAssignModal: React.FC<ForceAssignModalProps> = ({ isOpen, onClose, onAssign, context }) => {
  const [search, setSearch] = useState("");
  const [techs, setTechs] = useState<TechnicianSearchResult[]>([]); 
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    if (!isOpen) return;
    
    const loadTechs = async () => {
      setLoading(true);
      try {
        // ✅ Pass Context to API
        const results = await searchTechnicians(debouncedSearch, {
            zoneId: context.zoneId,
            serviceId: context.serviceId
        }); 
        setTechs(results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTechs();
  }, [debouncedSearch, isOpen, context]);

  const handleConfirm = async () => {
    if (!selectedTech) return;
    setAssigning(true);
    await onAssign(selectedTech);
    setAssigning(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 flex flex-col max-h-[80vh]">
        
        <div className="flex justify-between items-center mb-1 shrink-0">
          <h3 className="text-lg font-bold text-gray-900">Assign Technician</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <p className="text-xs text-gray-500 mb-4">
           Showing recommended technicians for this Zone & Service.
        </p>

        <div className="relative mb-4 shrink-0">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto border border-gray-100 rounded-lg mb-4">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Finding best matches...</div>
          ) : techs.length === 0 ? (
            <div className="p-8 text-center">
                <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Ban size={20} className="text-gray-400"/>
                </div>
                <p className="text-gray-500 text-sm">No matching technicians found.</p>
                <p className="text-xs text-gray-400 mt-1">Try removing filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {techs.map((tech, index) => {
                const isOnline = tech.isOnline;
                const isAvailable = tech.availabilityStatus === "AVAILABLE";
                // Top result that is online & free is the "Best Match"
                const isBestMatch = index === 0 && isOnline && isAvailable;

                return (
                  <div 
                    key={tech.id} 
                    onClick={() => setSelectedTech(tech.id)}
                    className={`p-3 flex items-center justify-between transition-colors cursor-pointer
                        ${selectedTech === tech.id ? 'bg-blue-50 ring-1 ring-blue-500 inset-0' : 'hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                         {tech.avatarUrl ? <img src={tech.avatarUrl} alt="" className="w-full h-full object-cover"/> : <Truck size={16} className="text-gray-500"/>}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            {tech.name}
                            {isBestMatch && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded font-bold tracking-wide">BEST MATCH</span>}
                        </p>
                        <div className="flex items-center gap-2 text-xs mt-0.5">
                            {isOnline ? (
                                <span className="text-green-600 flex items-center gap-1 font-medium"><Wifi size={12}/> Online</span>
                            ) : (
                                <span className="text-gray-400 flex items-center gap-1"><WifiOff size={12}/> Offline</span>
                            )}
                            <span className="text-gray-300">|</span>
                            <span className={isAvailable ? "text-gray-600" : "text-orange-600 font-medium"}>
                                {tech.availabilityStatus.replace("_", " ")}
                            </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                         {selectedTech === tech.id && <Check size={18} className="text-blue-600" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 shrink-0 pt-2 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
          <button 
            onClick={handleConfirm}
            disabled={!selectedTech || assigning}
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {assigning ? "Assigning..." : "Force Assign"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ForceAssignModal;