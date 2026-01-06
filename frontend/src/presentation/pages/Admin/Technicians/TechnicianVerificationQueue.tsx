import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  Eye,
  User
} from "lucide-react";
import { format } from "date-fns";

import { useDebounce } from "../../../hooks/useDebounce";
import { useNotification } from "../../../hooks/useNotification";

import * as techRepo from "../../../../infrastructure/repositories/admin/technicianRepository";
import type { TechnicianQueueItem } from "../../../../domain/types/Technician";
import { SearchFilterBar, PaginationBar } from "../../../components/Admin/Shared/DataTableControls";

const TechnicianVerificationQueue: React.FC = () => {
  const navigate = useNavigate();
  const { showError } = useNotification();
 
  const [items, setItems] = useState<TechnicianQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 500);
 
  useEffect(() => {
    loadQueue();
  }, [debouncedSearch, page]);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const result = await techRepo.getVerificationQueue({
        page,
        limit: 10,
        search: debouncedSearch
      });

      setItems(result.data || []);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err: unknown) {
      console.error(err);
      showError("Failed to load verification queue");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (id: string) => {
    navigate(`/admin/technicians/verification/${id}`);
  };

  return (
    <div className="h-full flex flex-col gap-4 sm:gap-6 overflow-hidden">

      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end shrink-0 border-b border-gray-200 pb-4 gap-4 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <CheckCircle className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" />
            Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Review and approve pending technician applications.
          </p>
        </div>

        {/* Stat Badge (Optional) */}
        <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg text-sm font-bold border border-orange-100 flex items-center gap-2">
          <Clock size={16} />
          <span>{total} Pending Reviews</span>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <SearchFilterBar
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        searchPlaceholder="Search by name, email or phone..." 
        onClear={() => setSearch("")}
        totalItems={total}
        currentCount={items.length}
        itemName="Applicants"
      />

      {/* 3. Table Content */}
      <div className="flex-1 overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Loading Queue...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <CheckCircle size={48} className="text-gray-200" />
            <p className="text-lg font-semibold text-gray-500">All Caught Up!</p>
            <p className="text-sm">No pending applications found.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Technician</th>
                  <th className="px-6 py-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Contact</th>
                  <th className="px-6 py-4 font-bold text-gray-600 uppercase text-xs tracking-wider">Submitted</th>
                  <th className="px-6 py-4 font-bold text-gray-600 uppercase text-xs tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                          {item.avatarUrl ? (
                            <img src={item.avatarUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <User size={18} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-yellow-100 text-yellow-700 mt-1">
                            Pending Review
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-700 font-medium">{item.email}</span>
                        <span className="text-gray-500 text-xs">{item.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {item.submittedAt ? format(new Date(item.submittedAt), "MMM d, yyyy") : "--"}
                      <div className="text-xs text-gray-400 mt-0.5">
                        {item.submittedAt ? format(new Date(item.submittedAt), "h:mm a") : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleReview(item.id)}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
                      >
                        <Eye size={16} /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Pagination */}
      <div className="bg-white z-10 relative">
        <PaginationBar
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default TechnicianVerificationQueue;