import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  ShieldCheck,
  Clock,
  Ban
} from "lucide-react";

import { useDebounce } from "../../../hooks/useDebounce";
import { useNotification } from "../../../hooks/useNotification";
import * as techRepo from "../../../../infrastructure/repositories/admin/technicianRepository";
import type { TechnicianQueueItem } from "../../../../domain/types/Technician";

// Shared Components
import { SearchFilterBar, PaginationBar } from "../../../components/Admin/Shared/DataTableControls";

const TechnicianList: React.FC = () => {
  const navigate = useNavigate();
  const { showError } = useNotification();

  const [items, setItems] = useState<TechnicianQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  const debouncedSearch = useDebounce(search, 500);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200"><ShieldCheck size={12}/> Verified</span>;
      case "REJECTED":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200"><Ban size={12}/> Rejected</span>;
      case "VERIFICATION_PENDING":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200"><Clock size={12}/> Review Pending</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">{status}</span>;
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

      {/* Table */}
      <div className="flex-1 overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
        {loading ? (
           <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
             <Users size={48} className="opacity-20 mb-2" />
             <p>No technicians found.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-600 uppercase text-xs">Technician</th>
                  <th className="px-6 py-4 font-bold text-gray-600 uppercase text-xs">Status</th>
                  <th className="px-6 py-4 font-bold text-gray-600 uppercase text-xs">Joined</th>
                  <th className="px-6 py-4 font-bold text-gray-600 uppercase text-xs text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/technicians/verification/${t.id}`)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border">
                          <img src={t.avatarUrl || "https://via.placeholder.com/40"} alt="" className="w-full h-full object-cover"/>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-500">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(t.status)}</td>
                    <td className="px-6 py-4 text-gray-500">
                        {new Date(t.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg font-bold text-xs">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white z-10 relative">
        <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default TechnicianList;