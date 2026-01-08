import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  ClipboardList,
  User,
  Calendar,
  ArrowUpDown,
  RefreshCw 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const debouncedSearch = useDebounce(search, 500);
 
  useEffect(() => {
    loadQueue();
  }, [debouncedSearch, page, sortOrder]);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const result = await techRepo.getVerificationQueue({
        page,
        limit: 10,
        search: debouncedSearch,
        sort: sortOrder,
        sortBy: "createdAt" 
      });

      setItems(result.data || []);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      showError("Failed to load verification queue");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (id: string) => {
    navigate(`/admin/technicians/verification/${id}`);
  };

  return (
    <div className="h-full flex flex-col gap-4 sm:gap-6 overflow-hidden bg-gray-50/30">

      {/* 1. Header with Controls (Sort & Refresh moved here) */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end shrink-0 border-b border-gray-200 pb-4 gap-4 sm:gap-0 bg-white px-4 pt-4 sm:px-0 sm:pt-0 sm:bg-transparent">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <CheckCircle className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" />
            Verification Queue
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Review and approve pending technician applications.
          </p>
        </div>

        {/* Right Side: Actions & Stats */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
             {/* Sort Button */}
             <button 
                onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
             >
                <ArrowUpDown size={14} className={`text-gray-500 ${sortOrder === "asc" ? "rotate-180" : ""} transition-transform`} />
                <span>{sortOrder === "asc" ? "Oldest First" : "Newest First"}</span>
             </button>

             {/* Refresh Button */}
             <button 
                onClick={loadQueue}
                disabled={loading}
                className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm disabled:opacity-50"
                title="Refresh List"
             >
                <RefreshCw size={18} className={loading ? "animate-spin text-blue-600" : ""} />
             </button>

            {/* Count Badge */}
            <div className="ml-2 bg-orange-50 text-orange-700 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold border border-orange-100 flex items-center gap-2">
                <Clock size={16} />
                <span>{total} Pending</span>
            </div>
        </div>
      </div>

      {/* 2. Filter Bar (Clean Search) */}
      <div className="px-4 sm:px-0">
          <SearchFilterBar
            search={search}
            onSearchChange={(val) => { setSearch(val); setPage(1); }}
            searchPlaceholder="Search applicants by name, email..." 
            onClear={() => setSearch("")}
            totalItems={total}
            currentCount={items.length}
            itemName="Applicants"
          />
      </div>

      {/* 3. Responsive List Content */}
      <div className="flex-1 overflow-hidden bg-white sm:rounded-2xl sm:shadow-sm sm:border border-gray-200 flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Loading Queue...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3 min-h-[300px]">
            <CheckCircle size={48} className="text-gray-200" />
            <p className="text-lg font-semibold text-gray-500">All Caught Up!</p>
            <p className="text-sm">No pending applications found.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            
            {/* --- DESKTOP TABLE HEADER --- */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 font-bold text-xs text-gray-500 uppercase tracking-wider sticky top-0 z-10">
                <div className="col-span-5">Technician Details</div>
                <div className="col-span-4">Submitted</div>
                <div className="col-span-3 text-right">Action</div>
            </div>

            {/* --- LIST ITEMS --- */}
            <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="group hover:bg-blue-50/30 transition-colors p-4 md:px-6 md:py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Column 1: Profile */}
                    <div className="col-span-1 md:col-span-5 flex items-center gap-3">
                        <div className="w-12 h-12 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0 relative">
                          {item.avatarUrl ? (
                            <img src={item.avatarUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <User size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm md:text-base truncate">{item.name}</p>
                          <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-2 text-xs text-gray-500">
                             <span className="truncate">{item.email}</span>
                             <span className="hidden md:inline">•</span>
                             <span>{item.phone}</span>
                          </div>
                        </div>
                    </div>

                    {/* Column 2: Date */}
                    <div className="col-span-1 md:col-span-4 flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} className="md:hidden text-gray-400" />
                        <div className="flex flex-row md:flex-col gap-2 md:gap-0.5 items-center md:items-start">
                             <span className="font-medium text-gray-700">
                                {item.submittedAt ? formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true }) : "--"}
                             </span>
                             <span className="text-xs text-gray-400 hidden md:inline-block">
                                {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : ""}
                             </span>
                        </div>
                    </div>

                    {/* Column 3: Action */}
                    <div className="col-span-1 md:col-span-3 flex justify-end">
                      <button
                        onClick={() => handleReview(item.id)}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 touch-manipulation"
                      >
                        <ClipboardList size={14} />
                            Review Application
                      </button>
                    </div>

                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Pagination */}
      <div className="bg-white z-10 relative border-t border-gray-200 sm:border-t-0">
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