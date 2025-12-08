import React, { useEffect, useState } from "react";
import {
  Plus, Trash2, MapPin, Save, XCircle, Edit2, Power,
  Search, Filter, ChevronLeft, ChevronRight
} from "lucide-react";
import { z } from "zod";
import ZoneMap from "../../../components/Maps/ZoneMap";
import * as zoneRepo from "../../../../infrastructure/repositories/zoneRepository";
import type { Zone, UpdateZoneDTO } from "../../../../domain/types/Zone";
import { useNotification } from "../../../hooks/useNotification";
import ConfirmModal from "../../../components/Modals/ConfirmModal";
import { useDebounce } from "../../../hooks/useDebounce";

const zoneNameSchema = z
  .string()
  .trim()
  .min(3, { message: "Zone name must be at least 3 characters long." })
  .regex(/^[a-zA-Z]/, { message: "Zone name must start with a letter." });

const Zones: React.FC = () => {
  const { showSuccess, showError } = useNotification();

  // --- Data State ---
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalZones, setTotalZones] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // --- Filter & Pagination State ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>(""); // "" = All
  const debouncedSearch = useDebounce(search, 500);

  // --- UI State ---
  const [isCreating, setIsCreating] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Form State ---
  const [zoneName, setZoneName] = useState("");
  const [zoneDesc, setZoneDesc] = useState("");
  const [zoneIsActive, setZoneIsActive] = useState(true);
  const [zonePoints, setZonePoints] = useState<{ lat: number; lng: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ✅ Trigger Fetch on Filters Change
  useEffect(() => {
    loadZones();
  }, [debouncedSearch, filterStatus, page]);

  const loadZones = async () => {
    try {
      setLoading(true);
      const result = await zoneRepo.getZones({
        page,
        limit: 4,
        search: debouncedSearch,
        isActive: filterStatus
      });
      setZones(result.data);
      setTotalZones(result.total);
      setTotalPages(result.totalPages);
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

  const handlePolygonComplete = (points: { lat: number; lng: number }[]) => {
    setZonePoints(points);
  };

  const getErrorMessage = (err: any) => {
    if (err.response?.data?.error) return err.response.data.error;
    if (err.response?.data?.message) return err.response.data.message;
    if (err.message) return err.message;
    return "Failed to save zone";
  };

  const handleSave = async () => {
    setError(null);
    const validationResult = zoneNameSchema.safeParse(zoneName);

    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message);
      return;
    }

    if (zonePoints.length < 3) {
      setError("Please draw a valid area (3+ points)");
      return;
    }

    try {
      const validName = validationResult.data;
      if (editingZoneId) {
        const payload: UpdateZoneDTO = { id: editingZoneId, name: validName, description: zoneDesc, boundaries: zonePoints, isActive: zoneIsActive };
        await zoneRepo.updateZone(payload);
        showSuccess("Zone updated successfully");
      } else {
        // @ts-ignore
        await zoneRepo.createZone({ name: validName, description: zoneDesc, boundaries: zonePoints, isActive: zoneIsActive });
        showSuccess("New zone created successfully");
      }
      await loadZones();
      handleCancel();
    } catch (err: any) {
      const errMsg = getErrorMessage(err);
      setError(errMsg);
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
      // Refresh logic: if last item on page deleted, go back
      if (zones.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      } else {
        await loadZones();
      }
      showSuccess("Zone deleted successfully");
      setDeleteModalOpen(false);
    } catch (err: any) {
      showError(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
      setZoneToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 overflow-y-auto lg:overflow-hidden pr-1 pb-4 lg:pb-0">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end shrink-0 border-b border-gray-200 pb-4 gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Zone Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage operational areas and service boundaries.</p>
        </div>

        {!isCreating && (
          <button
            onClick={handleStartCreate}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all text-sm font-semibold w-full sm:w-auto"
          >
            <Plus size={18} />
            Add New Zone
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-full min-h-0 lg:pb-2">

        {/* LEFT PANEL */}
        <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-6 h-auto lg:h-full min-h-0 order-2 lg:order-1">

          {isCreating ? (
            /* FORM PANEL */
            <div className={`
                bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-4 
                animate-in fade-in slide-in-from-left-4 duration-200
                h-auto lg:h-full lg:overflow-y-auto
                scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent 
                hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full pr-1
            `}>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  {editingZoneId ? <Edit2 size={18} className="text-blue-600" /> : <Plus size={18} className="text-green-600" />}
                  {editingZoneId ? "Edit Details" : "New Zone"}
                </h3>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-3 py-2.5 rounded-lg text-sm font-medium border border-red-100 flex items-start gap-2 animate-in zoom-in-95">
                  <XCircle size={16} className="mt-0.5 shrink-0" />
                  <span className="leading-tight">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Zone Name</label>
                  <input
                    value={zoneName}
                    onChange={(e) => {
                      setZoneName(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="e.g. North Bangalore"
                    className={`w-full px-3 h-10 text-sm border rounded-lg focus:ring-2 outline-none transition-all placeholder:text-gray-400 ${error && (error.includes("Name") || error.includes("character") || error.includes("letter"))
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/10"
                      }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Description</label>
                  <input
                    value={zoneDesc}
                    onChange={(e) => setZoneDesc(e.target.value)}
                    placeholder="Optional details"
                    className="w-full px-3 h-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-full ${zoneIsActive ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                      <Power size={16} />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-gray-800">Status</span>
                      <span className="block text-xs text-gray-500">{zoneIsActive ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setZoneIsActive(!zoneIsActive)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${zoneIsActive ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${zoneIsActive ? 'translate-x-5' : 'translate-x-0.5'
                        }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-auto pt-2">
                <button
                  onClick={handleSave}
                  disabled={zonePoints.length < 3}
                  className={`flex-1 flex justify-center items-center gap-2 h-10 rounded-lg text-sm font-bold text-white transition-all shadow-sm ${zonePoints.length < 3 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                    }`}
                >
                  <Save size={16} /> Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 h-10 flex justify-center items-center bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* LIST PANEL WITH SEARCH, FILTERS & PAGINATION */
            <div className={`
                bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col 
                h-auto lg:h-full lg:min-h-0 overflow-hidden
            `}>
              {/* Search & Filter Header */}
              <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex flex-col gap-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                      placeholder="Search zones..."
                      className="w-full pl-9 pr-3 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                      className="h-9 pl-3 pr-8 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                    >
                      <option value="">All</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                    <Filter size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {totalZones === 0 ? "No Zones Found" : `Showing ${zones.length} of ${totalZones}`}
                  </span>
                </div>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] max-h-[400px] lg:max-h-none">
              {loading ? (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">Loading...</div>
              ) : zones.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                  <MapPin size={32} className="mb-2 opacity-30" />
                  <p className="text-sm font-medium">No zones match your search.</p>
                </div>
              ) : (
                  zones.map((zone) => (
                    <div key={zone.id || zone._id} className="group p-4 rounded-xl bg-white border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all cursor-default relative">
                      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${zone.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                      <div className="flex justify-between items-center pl-3">
                        <div className="min-w-0">
                          <h4 className="text-base font-bold text-gray-900 truncate flex items-center gap-2">
                            {zone.name}
                            {!zone.isActive && <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-semibold border border-gray-200">INACTIVE</span>}
                          </h4>
                          <p className="text-sm text-gray-500 truncate mt-0.5">{zone.description || "No description provided"}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditZone(zone)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                          <button onClick={() => requestDelete(zone.id || zone._id!)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination Footer */}
              {totalPages > 1 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-xs font-medium text-gray-600">Page {page} of {totalPages}</span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: MAP */}
        <div className="w-full lg:flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative h-[400px] lg:h-full order-1 lg:order-2">
          <ZoneMap
            existingZones={zones.filter(z => (z.id || z._id) !== editingZoneId)}
            isDrawing={isCreating}
            initialPoints={zonePoints}
            onPolygonComplete={handlePolygonComplete}
            onPointsChange={(points) => setZonePoints(points)}
          />
          {isCreating && (
            <div className="absolute top-5 right-5 bg-white/95 backdrop-blur px-4 py-2.5 rounded-lg shadow-lg border border-blue-100 flex items-center gap-3 z-[400]">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <div>
                <span className="block text-xs font-bold text-gray-900 uppercase tracking-wide">{editingZoneId ? "Editing Shape" : "Drawing Mode"}</span>
                <span className="block text-xs text-gray-500 font-medium">
                  {zonePoints.length < 3 ? "Click map" : "Drag markers"}
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