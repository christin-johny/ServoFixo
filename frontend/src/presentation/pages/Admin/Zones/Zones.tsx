// frontend/src/presentation/pages/Admin/Zones/Zones.tsx
import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save, XCircle, Edit2, Power } from "lucide-react";
import ZoneMap from "../../../components/Maps/ZoneMap";
import * as zoneRepo from "../../../../infrastructure/repositories/zoneRepository";
import type { Zone, UpdateZoneDTO } from "../../../../domain/types/Zone";
import { useNotification } from "../../../hooks/useNotification";
import ConfirmModal from "../../../components/Modals/ConfirmModal";

const Zones: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [zoneName, setZoneName] = useState("");
  const [zoneDesc, setZoneDesc] = useState("");
  const [zoneIsActive, setZoneIsActive] = useState(true);
  const [zonePoints, setZonePoints] = useState<{ lat: number; lng: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadZones(); }, []);

  const loadZones = async () => {
    try {
      setLoading(true);
      const data = await zoneRepo.getZones();
      setZones(data);
    } catch (err) {
      console.error(err);
      showError("Failed to load zones list.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingZoneId(null);
    setZonePoints([]);
    setZoneName("");
    setZoneDesc("");
    setZoneIsActive(true);
    setError(null);
  };

  const handleEditZone = (zone: Zone) => {
    setIsCreating(true);
    setEditingZoneId(zone.id || zone._id || "");
    setZoneName(zone.name);
    setZoneDesc(zone.description);
    setZoneIsActive(zone.isActive);
    setZonePoints(zone.boundaries);
    setError(null);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingZoneId(null);
    setZonePoints([]);
  };

  const handleSave = async () => {
    if (!zoneName.trim()) { setError("Zone name is required"); return; }
    if (zonePoints.length < 3) { setError("Please draw a valid area (3+ points)"); return; }

    try {
      if (editingZoneId) {
        const payload: UpdateZoneDTO = { id: editingZoneId, name: zoneName, description: zoneDesc, boundaries: zonePoints, isActive: zoneIsActive };
        await zoneRepo.updateZone(payload);
        showSuccess("Zone updated successfully");
      } else {
        // @ts-ignore
        await zoneRepo.createZone({ name: zoneName, description: zoneDesc, boundaries: zonePoints, isActive: zoneIsActive });
        showSuccess("New zone created successfully");
      }
      await loadZones();
      handleCancel();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Failed to save zone";
      setError(errMsg);
      showError(errMsg);
    }
  };

  const requestDelete = (id: string) => {
    setZoneToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!zoneToDelete) return;
    setIsDeleting(true);
    try {
      await zoneRepo.deleteZone(zoneToDelete);
      setZones(zones.filter((z) => (z.id || z._id) !== zoneToDelete));
      showSuccess("Zone deleted successfully");
      setDeleteModalOpen(false);
    } catch (err: any) {
      showError(err.response?.data?.error || "Failed to delete zone");
    } finally {
      setIsDeleting(false);
      setZoneToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      
      {/* Header */}
      <div className="flex justify-between items-end shrink-0 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Zone Management</h1>
          <p className="text-base text-gray-500 mt-2">Manage operational areas and service boundaries.</p>
        </div>
        
        {!isCreating && (
          <button
            onClick={handleStartCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all text-base font-bold"
          >
            <Plus size={20} />
            Add New Zone
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0">
        
        {/* LEFT PANEL */}
        <div className="w-full lg:w-[420px] shrink-0 flex flex-col gap-6 h-full min-h-0">
          
          {isCreating ? (
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col gap-6 overflow-y-auto">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  {editingZoneId ? <Edit2 size={24} className="text-blue-600" /> : <Plus size={24} className="text-green-600" />}
                  {editingZoneId ? "Edit Details" : "New Zone"}
                </h3>
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-base font-medium border border-red-100 flex items-center gap-3">
                  <XCircle size={20} /> {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-2">Zone Name</label>
                  {/* h-12 is comfortable but not huge */}
                  <input
                    value={zoneName}
                    onChange={(e) => setZoneName(e.target.value)}
                    placeholder="e.g. North Bangalore"
                    className="w-full px-4 h-12 text-lg border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-700 mb-2">Description</label>
                  <input
                    value={zoneDesc}
                    onChange={(e) => setZoneDesc(e.target.value)}
                    placeholder="Optional details"
                    className="w-full px-4 h-12 text-lg border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-full ${zoneIsActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                      <Power size={22} />
                    </div>
                    <div>
                      <span className="block text-base font-bold text-gray-800">Status</span>
                      <span className="block text-sm text-gray-500">{zoneIsActive ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setZoneIsActive(!zoneIsActive)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${zoneIsActive ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${zoneIsActive ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div className="flex gap-4 mt-auto pt-4">
                <button
                  onClick={handleSave}
                  disabled={zonePoints.length < 3}
                  className={`flex-1 flex justify-center items-center gap-3 h-12 rounded-xl text-lg font-bold text-white transition-all shadow-md ${
                    zonePoints.length < 3 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
                  }`}
                >
                  <Save size={20} /> Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 h-12 flex justify-center items-center bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-lg font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* Zone List */
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">All Zones</span>
                <span className="bg-white border border-gray-200 text-gray-800 text-sm px-3 py-1 rounded-full font-bold">{zones.length}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {zones.map((zone) => (
                  <div key={zone.id || zone._id} className="group p-5 rounded-2xl bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-default relative">
                    <div className={`absolute left-0 top-5 bottom-5 w-1.5 rounded-r-full ${zone.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                    <div className="flex justify-between items-center pl-5">
                      <div className="min-w-0">
                        <h4 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                          {zone.name}
                          {!zone.isActive && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg font-bold border border-gray-200">INACTIVE</span>}
                        </h4>
                        <p className="text-base text-gray-500 truncate mt-1">{zone.description || "No description provided"}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditZone(zone)} className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={20} /></button>
                        <button onClick={() => requestDelete(zone.id || zone._id!)} className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: MAP */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden relative h-full min-h-[500px]">
          <ZoneMap
            existingZones={zones.filter(z => (z.id || z._id) !== editingZoneId)}
            isDrawing={isCreating}
            initialPoints={zonePoints}
            onPolygonComplete={(points) => setZonePoints(points)}
            onPointsChange={(points) => setZonePoints(points)}
          />
          {isCreating && (
            <div className="absolute top-6 right-6 bg-white/95 backdrop-blur px-6 py-4 rounded-xl shadow-xl border border-blue-100 flex items-center gap-4 z-[400]">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
              </span>
              <div>
                <span className="block text-sm font-bold text-gray-900 uppercase tracking-wide">{editingZoneId ? "Editing Shape" : "Drawing Mode"}</span>
                <span className="block text-sm text-gray-500 font-medium mt-0.5">
                  {zonePoints.length < 3 ? "Click map to set points" : "Drag markers to adjust"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Zone"
        message="Are you sure you want to delete this zone permanently? This action cannot be undone."
        confirmText="Delete Zone"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Zones;