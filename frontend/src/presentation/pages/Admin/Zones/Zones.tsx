import React, { useEffect, useState } from "react";
import { Plus, Trash2, MapPin, Save, XCircle, Edit2, Power } from "lucide-react";
import ZoneMap from "../../../components/Maps/ZoneMap";
import * as zoneRepo from "../../../../infrastructure/repositories/zoneRepository";
import type { Zone, CreateZoneDTO, UpdateZoneDTO } from "../../../../domain/types/Zone";

const Zones: React.FC = () => {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [isCreating, setIsCreating] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);

  // Form State
  const [zoneName, setZoneName] = useState("");
  const [zoneDesc, setZoneDesc] = useState("");
  const [zoneIsActive, setZoneIsActive] = useState(true); // ✅ NEW: Status State
  const [zonePoints, setZonePoints] = useState<{ lat: number; lng: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      setLoading(true);
      const data = await zoneRepo.getZones();
      setZones(data);
    } catch (err) {
      console.error("Failed to load zones", err);
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
    setZoneIsActive(true); // Default to active
    setError(null);
  };

  const handleEditZone = (zone: Zone) => {
    setIsCreating(true);
    setEditingZoneId(zone.id || zone._id || "");
    setZoneName(zone.name);
    setZoneDesc(zone.description);
    setZoneIsActive(zone.isActive); // ✅ NEW: Load existing status
    setZonePoints(zone.boundaries);
    setError(null);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingZoneId(null);
    setZonePoints([]);
  };

  const handlePolygonComplete = (points: { lat: number; lng: number }[]) => {
    setZonePoints(points);
  };

  const handleSave = async () => {
    if (!zoneName.trim()) {
      setError("Zone name is required");
      return;
    }
    if (zonePoints.length < 3) {
      setError("Please draw a valid area on the map (at least 3 points)");
      return;
    }

    try {
      if (editingZoneId) {
        // UPDATE
        const payload: UpdateZoneDTO = {
          id: editingZoneId,
          name: zoneName,
          description: zoneDesc,
          boundaries: zonePoints,
          isActive: zoneIsActive // ✅ NEW: Send status
        };
        await zoneRepo.updateZone(payload);
      } else {
        // CREATE
        const payload: CreateZoneDTO = { // Type assertion if DTO not updated in TS yet
          name: zoneName,
          description: zoneDesc,
          boundaries: zonePoints,
          // @ts-ignore - Ignore if CreateZoneDTO type isn't updated in frontend types yet
          isActive: zoneIsActive 
        };
        await zoneRepo.createZone(payload);
      }

      await loadZones();
      handleCancel();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save zone");
    }
  };

  const handleDeleteZone = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this zone?")) return;
    try {
      await zoneRepo.deleteZone(id);
      setZones(zones.filter((z) => (z.id || z._id) !== id));
    } catch (err: any) {
      alert("Failed to delete: " + (err.response?.data?.error || "Unknown error"));
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6">
      {/* LEFT PANEL */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Zones</h1>
          {!isCreating && (
            <button
              onClick={handleStartCreate}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              New Zone
            </button>
          )}
        </div>

        {isCreating ? (
          <div className="bg-white p-4 rounded-xl shadow border border-blue-100 flex flex-col gap-4">
            <h3 className="font-semibold text-lg text-blue-800">
              {editingZoneId ? "Edit Zone" : "Create New Zone"}
            </h3>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-sm border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                placeholder="e.g. North Bangalore"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                value={zoneDesc}
                onChange={(e) => setZoneDesc(e.target.value)}
                placeholder="Optional details"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* ✅ NEW: Active Status Toggle */}
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-100">
              <div className="flex items-center gap-2">
                <Power size={18} className={zoneIsActive ? "text-green-600" : "text-gray-400"} />
                <span className="text-sm font-medium text-gray-700">Status</span>
              </div>
              <button
                onClick={() => setZoneIsActive(!zoneIsActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  zoneIsActive ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    zoneIsActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
              <span className="font-medium text-gray-700">Map Actions:</span>
              <ul className="list-disc ml-4 mt-1 space-y-1">
                <li>Click map to add/change points.</li>
                <li>Drag markers to adjust area.</li>
              </ul>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSave}
                disabled={zonePoints.length < 3}
                className={`flex-1 flex justify-center items-center gap-2 py-2 rounded-lg text-white transition-colors ${
                  zonePoints.length < 3 ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <Save size={18} />
                {editingZoneId ? "Update" : "Save"}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 flex justify-center items-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
              >
                <XCircle size={18} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading zones...</div>
            ) : zones.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No zones found. Create one to get started.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {zones.map((zone) => (
                  <div key={zone.id || zone._id} className="p-4 hover:bg-gray-50 transition-colors group">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 flex items-center gap-2">
                          <MapPin size={16} className="text-blue-500" />
                          {zone.name}
                          
                          {/* ✅ NEW: Active/Inactive Badge */}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            zone.isActive 
                              ? "bg-green-50 text-green-700 border-green-200" 
                              : "bg-gray-100 text-gray-500 border-gray-200"
                          }`}>
                            {zone.isActive ? "Active" : "Inactive"}
                          </span>
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">{zone.description || "No description"}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditZone(zone)}
                          className="text-gray-400 hover:text-blue-600 p-1"
                          title="Edit Zone"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteZone(zone.id || zone._id!)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Delete Zone"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT PANEL: MAP */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
        <ZoneMap
          existingZones={zones.filter(z => (z.id || z._id) !== editingZoneId)}
          isDrawing={isCreating}
          initialPoints={zonePoints}
          onPolygonComplete={handlePolygonComplete}
          onPointsChange={(points) => setZonePoints(points)}
        />
        
        {isCreating && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow text-sm font-medium text-blue-700 z-[400] border border-blue-200 animate-pulse">
            {editingZoneId ? "Editing Mode" : "Drawing Mode"}
          </div>
        )}
      </div>
    </div>
  );
};

export default Zones;