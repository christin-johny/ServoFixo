import React, { useEffect, useState } from "react";
import { Users, RefreshCw } from "lucide-react";

import { useDebounce } from "../../../hooks/useDebounce";
import { useNotification } from "../../../hooks/useNotification";
import * as techRepo from "../../../../infrastructure/repositories/admin/technicianRepository";
// Import strict types
import type { TechnicianListItem, UpdateTechnicianPayload } from "../../../../infrastructure/repositories/admin/technicianRepository";

// Shared Components
import { SearchFilterBar, PaginationBar } from "../../../components/Admin/Shared/DataTableControls";
import TechnicianListTable from "../../../components/Admin/technician/TechnicianListTable";
import TechnicianEditModal from "../../../components/Admin/technician/TechnicianEditModal";
import ConfirmModal from "../../../components/Admin/Modals/ConfirmModal";

const TechnicianList: React.FC = () => {
  const { showSuccess, showError } = useNotification();

  const [items, setItems] = useState<TechnicianListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  const debouncedSearch = useDebounce(search, 500);

  // Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [techToEdit, setTechToEdit] = useState<TechnicianListItem | null>(null);

  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [techToSuspend, setTechToSuspend] = useState<TechnicianListItem | null>(null);
  const [isSuspending, setIsSuspending] = useState(false);

  useEffect(() => {
    loadData();
  }, [debouncedSearch, page, filterStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await techRepo.getTechnicians({
        page,
        limit: 10,
        search: debouncedSearch,
        status: filterStatus || undefined
      });

      setItems(result.data || []);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      showError("Failed to load technicians");
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---

  const handleEdit = (tech: TechnicianListItem) => {
    setTechToEdit(tech);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (id: string, data: UpdateTechnicianPayload) => {
    try {
        await techRepo.updateTechnician(id, data);
        showSuccess("Technician profile updated successfully");
        loadData(); 
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update";
        showError(msg);
        throw err;
    }
  };

  const handleToggleStatus = (tech: TechnicianListItem) => {
    setTechToSuspend(tech);
    setSuspendModalOpen(true);
  };

  const confirmSuspend = async () => {
    if(!techToSuspend) return;
    setIsSuspending(true);
    try {
        const isCurrentlySuspended = techToSuspend.isSuspended;
        await techRepo.toggleBlockTechnician(techToSuspend.id, !isCurrentlySuspended);
        
        showSuccess(`Technician ${!isCurrentlySuspended ? 'Suspended' : 'Activated'}`);
        loadData();
    } catch {
        showError("Failed to update status");
    } finally {
        setIsSuspending(false);
        setSuspendModalOpen(false);
        setTechToSuspend(null);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 sm:gap-6 overflow-hidden">
      
      {/* Header */}
      <div className="shrink-0 border-b border-gray-200 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" /> 
            Technician Directory
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage all registered technicians (Verified, Rejected, and Pending).
          </p>
      </div>

      {/* Controls */}
      <SearchFilterBar
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        searchPlaceholder="Search name, email, phone..."
        filterStatus={filterStatus}
        onFilterChange={(val) => { setFilterStatus(val); setPage(1); }}
        onClear={() => { setSearch(""); setFilterStatus(""); }}
        filterOptions={[
          { label: "Verified", value: "VERIFIED" },
          { label: "Rejected", value: "REJECTED" },
          { label: "Pending Review", value: "VERIFICATION_PENDING" },
          { label: "Incomplete Profile", value: "PENDING" }
        ]}
        totalItems={total}
        currentCount={items.length}
        itemName="Technicians"
      />

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {loading ? (
           <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
             <RefreshCw size={32} className="animate-spin opacity-20" />
             <p className="text-sm font-medium">Loading Technicians...</p>
           </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
             <Users size={48} className="opacity-20 mb-2" />
             <p>No technicians found.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto pr-1 pb-4 scrollbar-thin scrollbar-thumb-gray-200">
             <TechnicianListTable 
                technicians={items}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
             />
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="bg-white z-10 relative">
        <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {/* Edit Modal */}
      <TechnicianEditModal 
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        technician={techToEdit}
        onSave={handleSaveEdit}
      />

      {/* Suspend Confirmation */}
      <ConfirmModal 
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        onConfirm={confirmSuspend}
        title={techToSuspend?.isSuspended ? "Activate Account" : "Suspend Account"}
        message={
            techToSuspend?.isSuspended 
            ? `Are you sure you want to reactivate ${techToSuspend?.name}? They will be able to accept jobs again.` 
            : `Are you sure you want to suspend ${techToSuspend?.name}? They will be blocked from the platform immediately.`
        }
        confirmText={techToSuspend?.isSuspended ? "Activate" : "Suspend"}
        variant={techToSuspend?.isSuspended ? "success" : "danger"}
        isLoading={isSuspending}
      />
    </div>
  );
};

export default TechnicianList;