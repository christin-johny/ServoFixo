import React, { useState, useEffect } from "react";
import { Search, X, Check, Truck, Ban } from "lucide-react";
import { searchTechnicians,type TechnicianSearchResult } from "../../../../infrastructure/repositories/admin/adminBookingRepository"; 
import { useDebounce } from "../../../hooks/useDebounce";

interface ForceAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (techId: string) => Promise<void>;
}

const ForceAssignModal: React.FC<ForceAssignModalProps> = ({ isOpen, onClose, onAssign }) => {
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
        const results = await searchTechnicians(debouncedSearch); 
        setTechs(results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTechs();
  }, [debouncedSearch, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!selectedTech) return;
    setAssigning(true);
    await onAssign(selectedTech);
    setAssigning(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 flex flex-col max-h-[80vh]">
        
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h3 className="text-lg font-bold text-gray-900">Force Assign Technician</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

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
            <div className="p-4 text-center text-gray-400 text-sm">Searching...</div>
          ) : techs.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">No technicians found.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {techs.map((tech) => {
                // Rule: Only assign Available & Online techs
                const isAvailable = tech.availabilityStatus === "AVAILABLE" && tech.isOnline; 

                return (
                  <div 
                    key={tech.id} 
                    onClick={() => {
                        if (isAvailable) setSelectedTech(tech.id);
                    }}
                    className={`p-3 flex items-center justify-between transition-colors 
                        ${isAvailable ? 'cursor-pointer hover:bg-blue-50' : 'opacity-50 cursor-not-allowed bg-gray-50'}
                        ${selectedTech === tech.id ? 'bg-blue-50 ring-1 ring-blue-500 inset-0' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                         {tech.avatarUrl ? <img src={tech.avatarUrl} alt="" className="w-full h-full object-cover"/> : <Truck size={16} className="text-gray-500"/>}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{tech.name}</p>
                        <p className="text-xs text-gray-500">{tech.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {!isAvailable ? (
                            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded flex items-center gap-1">
                                <Ban size={10} /> BUSY/OFFLINE
                            </span>
                        ) : selectedTech === tech.id ? (
                            <Check size={18} className="text-blue-600" />
                        ) : null}
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
            {assigning ? "Assigning..." : "Assign Selected"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ForceAssignModal;