import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Briefcase, Calendar, MapPin, IndianRupee, 
  ChevronRight, CheckCircle2, XCircle, Clock, 
  ArrowLeft
} from "lucide-react";
import { getTechnicianJobs } from "../../../../infrastructure/repositories/technician/technicianBookingRepository";
import { useNotification } from "../../../hooks/useNotification";
import { useDebounce } from "../../../hooks/useDebounce";

import { DataTable, type TableColumn } from "../../../components/Shared/Table/DataTable";
import { SearchFilterBar, PaginationBar } from "../../../components/Shared/Table/DataTableControls";

// --- Types ---
interface JobData {
  id: string;
  status: string;
  snapshots: {
    service: { name: string; categoryId: string };
    customer: { name: string; phone: string; avatarUrl?: string };
  };
  location: { address: string; coordinates?: { lat: number; lng: number } };
  pricing: { 
    final?: number; 
    estimated: number; 
  };
  timestamps: { createdAt: string; completedAt?: string };
}

interface JobsApiResponse {
  data: JobData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const MyJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showError } = useNotification();
  
  // State
  const [data, setData] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState<"ACTIVE" | "HISTORY">("ACTIVE");

  useEffect(() => {
    fetchJobs();
  }, [page, debouncedSearch, statusFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      //   LOGIC FIX: Explicitly define status arrays
      let statuses: string | string[] | undefined;

      if (statusFilter === "ACTIVE") {
         // Backend handles the string 'active' specially to include [ACCEPTED...COMPLETED]
         statuses = "active"; 
      } else {
         // For History, we explicitly ask for these statuses
         statuses = [
             "PAID", 
             "CANCELLED", 
             "REJECTED", 
             "FAILED_ASSIGNMENT", 
             "TIMEOUT", 
             "CANCELLED_BY_TECH"
         ];
      }

      const response = await getTechnicianJobs({
        page,
        limit: 10,
        search: debouncedSearch,
        status: statuses 
      }) as unknown as JobsApiResponse;

      setData(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);

    } catch (err) {
      console.error(err);
      showError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  // --- Helpers & Columns (Keep existing) ---
  const renderStatus = (status: string) => {
    const s = status.replace(/_/g, " "); // Fix: Replace ALL underscores
    switch (status) {
      case "PAID": 
        return <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3"/> {s}</span>;
      case "COMPLETED": 
        return <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3"/> Payment Pending</span>;
      case "CANCELLED": 
      case "REJECTED":
      case "TIMEOUT":
      case "CANCELLED_BY_TECH":
        return <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"><XCircle className="w-3 h-3"/> {s}</span>;
      default: 
        return <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 animate-pulse"><Clock className="w-3 h-3"/> {s}</span>;
    }
  };

  const columns: TableColumn<JobData>[] = [
    {
      header: "Service Info",
      className: "w-[280px]",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 text-sm">{item.snapshots?.service?.name || "Unknown Service"}</span>
          <span className="text-[11px] font-mono text-gray-400 mt-0.5">ID: #{item.id.slice(-6).toUpperCase()}</span>
        </div>
      )
    },
    {
      header: "Customer Location",
      render: (item) => (
        <div className="max-w-[220px]">
          <p className="text-sm font-medium text-gray-900">{item.snapshots?.customer?.name || "Unknown"}</p>
          <div className="flex items-start gap-1 mt-1 text-gray-500">
             <MapPin className="w-3 h-3 shrink-0 mt-0.5" /> 
             <p className="text-xs truncate">{item.location.address}</p>
          </div>
        </div>
      )
    },
    {
      header: "Date",
      render: (item) => (
        <div className="text-xs font-medium text-gray-500 flex flex-col gap-1">
           <div className="flex items-center gap-1.5">
             <Calendar className="w-3.5 h-3.5" />
             {new Date(item.timestamps.createdAt).toLocaleDateString()}
           </div>
           <div className="flex items-center gap-1.5 text-gray-400">
             <Clock className="w-3.5 h-3.5" />
             {new Date(item.timestamps.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
           </div>
        </div>
      )
    },
    {
      header: "Status",
      render: (item) => renderStatus(item.status)
    },
    {
      header: "Earnings",
      render: (item) => (
        <span className="font-bold text-gray-900 flex items-center gap-0.5">
          <IndianRupee className="w-3.5 h-3.5" />
          {item.pricing.final || item.pricing.estimated}
        </span>
      )
    },
    {
      header: "",
      className: "text-right",
      render: (item) => (
        <button 
          onClick={(e) => { e.stopPropagation(); navigate(`/technician/jobs/${item.id}`); }}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )
    }
  ];

  const renderMobileCard = (item: JobData) => (
    <div 
        onClick={() => navigate(`/technician/jobs/${item.id}`)}
        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 active:scale-[0.98] transition-all"
    >
       <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 font-mono tracking-wider">#{item.id.slice(-6).toUpperCase()}</span>
            <h3 className="font-bold text-gray-900 text-base leading-tight">{item.snapshots?.service?.name || "Unknown Service"}</h3>
          </div>
          {renderStatus(item.status)}
       </div>

       <div className="flex items-start gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-50">
          <div className="p-1.5 bg-white rounded-lg shadow-sm text-gray-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
             <p className="text-xs text-gray-500 font-medium mb-0.5">Location</p>
             <p className="text-sm text-gray-900 font-medium line-clamp-1">{item.location.address}</p>
          </div>
       </div>

       <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-1">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
             <Calendar className="w-3.5 h-3.5" /> 
             {new Date(item.timestamps.createdAt).toLocaleDateString()}
          </div>
          
          <div className="flex items-center gap-1">
             <span className="text-xs text-gray-400 font-medium mr-1">Est.</span>
             <span className="font-extrabold text-gray-900 text-lg flex items-center">
                <IndianRupee className="w-4 h-4" />{item.pricing.final || item.pricing.estimated}
             </span>
          </div>
       </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen space-y-6 animate-fade-in pb-24 md:pb-12 font-sans">
      
      {/* --- 1. NAVIGATION & HEADER --- */}
      <div className="space-y-4 pt-2">
        <div>
            <button
                onClick={() => navigate("/technician")}
                className="group flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors px-1"
            >
                <div className="p-1 rounded-full bg-white border border-gray-200 group-hover:border-gray-300 shadow-sm transition-all">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                Back to Dashboard
            </button>
        </div>

        <div className="flex flex-col gap-1 px-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Job History
            </h1>
            <p className="text-sm text-gray-500">
                View current tasks and past performance.
            </p>
        </div>
      </div>

      {/* --- 2. TABS & SEARCH --- */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200">
         
         <div className="flex p-1 bg-gray-100/80 rounded-xl mb-4">
            <button 
              onClick={() => { setStatusFilter("ACTIVE"); setPage(1); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${statusFilter === "ACTIVE" ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Briefcase className="w-4 h-4" /> Active Jobs
            </button>
            <button 
              onClick={() => { setStatusFilter("HISTORY"); setPage(1); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${statusFilter === "HISTORY" ? "bg-white text-gray-900 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Clock className="w-4 h-4" /> History
            </button>
         </div>

         <SearchFilterBar 
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search by ID or Service Name..."
            totalItems={total}
            currentCount={data.length}
            itemName="Jobs"
         />
      </div>

      {/* --- 3. DATA CONTENT --- */}
      <div className="flex-1">
         <div className="bg-white md:rounded-2xl md:shadow-sm md:border md:border-gray-200 overflow-hidden min-h-[400px] flex flex-col rounded-xl border border-gray-200 shadow-sm">
            <DataTable 
               data={data}
               columns={columns}
               keyField="id"
               isLoading={loading}
               emptyMessage={
                 <div className="text-center py-12">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-gray-900 font-bold">No jobs found</h3>
                    <p className="text-gray-500 text-sm mt-1">Try adjusting your search or filters.</p>
                 </div>
               }
               renderMobileCard={renderMobileCard}
               onRowClick={(item) => navigate(`/technician/jobs/${item.id}`)}
            />
         </div>
      </div>

      {/* --- 4. PAGINATION --- */}
      <div className="pb-8">
         <PaginationBar 
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
         />
      </div>

    </div>
  );
};

export default MyJobsPage;