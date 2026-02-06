import React, { useEffect, useState } from "react";
import { Users, Eye, Edit2, ClipboardList, Clock, ToggleLeft, ToggleRight, Ban, ShieldCheck, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useDebounce } from "../../../hooks/useDebounce";
import { useNotification } from "../../../hooks/useNotification";
import * as techRepo from "../../../../infrastructure/repositories/admin/technicianRepository";
import type { TechnicianListItem, UpdateTechnicianPayload } from "../../../../infrastructure/repositories/admin/technicianRepository";

import { SearchFilterBar, PaginationBar } from "../../../components/Shared/Table/DataTableControls";
import { DataTable, type TableColumn } from "../../../components/Shared/Table/DataTable";
import TechnicianEditModal from "../../../components/Admin/technician/TechnicianEditModal";
import ConfirmModal from "../../../components/Shared/ConfirmModal/ConfirmModal";

const TechnicianList: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const [items, setItems] = useState<TechnicianListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const debouncedSearch = useDebounce(search, 500);

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

  const handleReviewApplication = (id: string) => {
    navigate(`/admin/technicians/verification/${id}`);
  };

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
    if (!techToSuspend) return;
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

  // --- UI HELPERS ---
  const getStatusBadge = (status: string, isSuspended: boolean) => {
    if (isSuspended) return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200"><Ban size={12} /> Suspended</span>;
    switch (status) {
      case "VERIFIED": return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200"><ShieldCheck size={12} /> Verified</span>;
      case "REJECTED": return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200"><AlertCircle size={12} /> Rejected</span>;
      case "VERIFICATION_PENDING": return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200"><Clock size={12} /> Review Pending</span>;
      default: return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">Pending</span>;
    }
  };

  const renderActions = (tech: TechnicianListItem, isMobile = false) => {
    if (tech.status === 'VERIFICATION_PENDING') {
      return (
        <button onClick={() => handleReviewApplication(tech.id)} className={`flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors ${isMobile ? 'w-full py-2' : ''}`}>
          <ClipboardList size={14} /> Review Application
        </button>
      );
    }

    if (tech.status === 'VERIFIED') {
      return (
        // Hover Removed: 'opacity-0' class deleted. Actions are always visible.
        <div className={`flex gap-2 ${isMobile ? 'w-full' : 'justify-end'}`}>
          <button onClick={() => navigate(`/admin/technicians/${tech.id}`)} className={`p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors ${isMobile ? 'flex-1 flex items-center justify-center bg-gray-50' : ''}`} title="View">
            <Eye size={16} /> {isMobile && <span className="ml-2 text-xs font-bold">View</span>}
          </button>

          <button onClick={() => handleEdit(tech)} className={`p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors ${isMobile ? 'flex-1 flex items-center justify-center bg-gray-50' : ''}`} title="Edit">
            <Edit2 size={16} /> {isMobile && <span className="ml-2 text-xs font-bold">Edit</span>}
          </button>

          <button
            onClick={() => handleToggleStatus(tech)}
            className={`p-2 rounded-lg transition-colors ${isMobile ? 'flex-1 flex items-center justify-center bg-gray-50' : ''} ${tech.isSuspended
                ? 'text-green-600 hover:bg-green-50'   // Suspended -> Green (Activate)
                : 'text-red-600 hover:bg-red-50'       // Active -> Red (Suspend)
              }`}
            title={tech.isSuspended ? "Activate" : "Suspend"}
          >
            {/* Icon Logic: If Suspended (Action: Activate), show ToggleRight (On), else ToggleLeft (Off) */}
            {tech.isSuspended ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}

            {isMobile && (
              <span className="ml-2 text-xs font-bold">
                {tech.isSuspended ? "Activate" : "Suspend"}
              </span>
            )}
          </button>
        </div>
      );
    }
    return <span className="text-gray-300 text-xs italic">No actions</span>;
  };

  // --- TABLE CONFIGURATION ---
  const columns: TableColumn<TechnicianListItem>[] = [
    {
      header: "Technician",
      className: "w-[250px]",
      render: (tech) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-100 overflow-hidden flex-shrink-0">
            {tech.avatarUrl ? <img src={tech.avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">{tech.name[0]}</div>}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{tech.name}</p>
            <p className="text-xs text-gray-500 font-mono">ID: {tech.id.slice(-6)}</p>
          </div>
        </div>
      )
    },
    {
      header: "Contact",
      className: "w-[250px]",
      render: (tech) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm text-gray-700 font-medium">{tech.email}</span>
          <span className="text-xs text-gray-500">{tech.phone}</span>
        </div>
      )
    },
    {
      header: "Status",
      className: "w-[150px]",
      render: (tech) => getStatusBadge(tech.status, tech.isSuspended)
    },
    {
      header: "Joined",
      className: "w-[150px]",
      render: (tech) => <span className="text-sm text-gray-500">{new Date(tech.submittedAt).toLocaleDateString()}</span>
    },
    {
      header: "Actions",
      className: "text-right w-[180px]",
      render: (tech) => renderActions(tech, false)
    }
  ];

  return (
    <div className="h-full flex flex-col gap-4 sm:gap-6 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-gray-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Users className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" />
          Technician Directory
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage all registered technicians.
        </p>
      </div>

      {/* Controls */}
      <SearchFilterBar
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        searchPlaceholder="Search name, email..."
        filterStatus={filterStatus}
        onFilterChange={(val) => { setFilterStatus(val); setPage(1); }}
        onClear={() => { setSearch(""); setFilterStatus(""); }}
        filterOptions={[
          { label: "Verified", value: "VERIFIED" },
          { label: "Rejected", value: "REJECTED" },
          { label: "Pending Review", value: "VERIFICATION_PENDING" },
          { label: "Pending", value: "PENDING" }
        ]}
        totalItems={total}
        currentCount={items.length}
        itemName="Technicians"
      />

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <DataTable
          data={items}
          columns={columns}
          keyField="id"
          isLoading={loading}
          emptyMessage="No technicians found."
          // Mobile Card Render Logic
          renderMobileCard={(tech) => (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                    {tech.avatarUrl ? <img src={tech.avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">{tech.name[0]}</div>}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{tech.name}</h3>
                    <p className="text-xs text-gray-500 font-mono">ID: {tech.id.slice(-6)}</p>
                  </div>
                </div>
                <div>{getStatusBadge(tech.status, tech.isSuspended)}</div>
              </div>
              <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2"><span className="truncate">{tech.email}</span></div>
                <div className="flex items-center gap-2"><span>{tech.phone}</span></div>
              </div>
              <div className="pt-2 border-t border-gray-100">
                {renderActions(tech, true)}
              </div>
            </div>
          )}
        />
      </div>

      {/* Pagination */}
      <div className="bg-white z-10 relative">
        <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <TechnicianEditModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} technician={techToEdit} onSave={handleSaveEdit} />

      <ConfirmModal
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        onConfirm={confirmSuspend}
        title={techToSuspend?.isSuspended ? "Activate Account" : "Suspend Account"}
        message={techToSuspend?.isSuspended ? `Are you sure you want to reactivate ${techToSuspend?.name}?` : `Are you sure you want to suspend ${techToSuspend?.name}?`}
        confirmText={techToSuspend?.isSuspended ? "Activate" : "Suspend"}
        variant={techToSuspend?.isSuspended ? "success" : "danger"}
        isLoading={isSuspending}
      />
    </div>
  );
};

export default TechnicianList;