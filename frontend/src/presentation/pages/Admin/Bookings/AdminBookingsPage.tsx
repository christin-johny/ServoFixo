import React, { useEffect, useState ,useCallback} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CalendarClock, Clock, ArrowUpDown, RefreshCw,
  MapPin, User, Briefcase, ChevronRight, AlertCircle,
  CheckCircle2, XCircle, IndianRupee, Filter, X,
  Layers
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useDebounce } from "../../../hooks/useDebounce";
//import { useNotification } from "../../../hooks/useNotification";
import { 
  getAllBookings, 
  type AdminBookingListDto, 
  type BookingStatus 
} from "../../../../infrastructure/repositories/admin/adminBookingRepository";

//   Reuse your existing components
import { SearchFilterBar, PaginationBar } from "../../../components/Shared/Table/DataTableControls";
import LoaderFallback from "../../../components/LoaderFallback";
import { getCategories } from "../../../../infrastructure/repositories/admin/serviceCategoryRepository"; // Update path if needed
import type { ServiceCategory } from "../../../../domain/types/ServiceCategory";

import { socketService, type AdminUpdateEvent } from "../../../../infrastructure/api/socketClient";
 

const AdminBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  //const { showError } = useNotification();

  // --- Logic: Determine Mode (Live vs History) ---
  const isHistory = location.pathname.includes("history");
  const pageTitle = isHistory ? "Booking History" : "Live Feed";
  const pageSubtitle = isHistory 
    ? "Review past completions and cancellations." 
    : "Monitor ongoing jobs in real-time.";
  
  // --- State: Data ---
  const [items, setItems] = useState<AdminBookingListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  
  // --- State: Filters ---
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  
  //   ADDED: All 4 Required Filters
  const [filterStatus, setFilterStatus] = useState<string>(""); 
  const [filterCategory, setFilterCategory] = useState<string>(""); 
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  
  const [showFilters, setShowFilters] = useState(false); // Toggle visibility

  const debouncedSearch = useDebounce(search, 500);


  useEffect(() => {
    const loadCats = async () => {
        try {
            // Fetch active categories for the dropdown
            // We request page 1 with a high limit (e.g., 100) to get all of them
            const response = await getCategories({ 
                page: 1, 
                limit: 100, 
                search: "", 
                isActive: "true" 
            });
            
            setCategories(response.categories);
        } catch   {
            console.error("Failed to load categories for filter");
        }
    };
    loadCats();
  }, []);
  useEffect(() => {
    setFilterStatus("");
    setFilterCategory("");
    setStartDate("");
    setEndDate("");
    setPage(1);
    setSearch("");
  }, [isHistory]);

  useEffect(() => {
    fetchBookings();
  }, [debouncedSearch, page, sortOrder, isHistory, filterStatus, filterCategory, startDate, endDate]);
 
  
  const fetchBookings = useCallback(async () => {
    try { 
      if (items.length === 0) setLoading(true);

      const liveStatuses: BookingStatus[] = [
        "REQUESTED", "ASSIGNED_PENDING", "ACCEPTED", "EN_ROUTE", "REACHED", "IN_PROGRESS", "EXTRAS_PENDING"
      ];
      const historyStatuses: BookingStatus[] = [
        "COMPLETED", "PAID", "CANCELLED", "FAILED_ASSIGNMENT", "TIMEOUT", "CANCELLED_BY_TECH"
      ];

      let finalStatus: BookingStatus | BookingStatus[] = isHistory ? historyStatuses : liveStatuses;
      if (filterStatus) {
         finalStatus = filterStatus as BookingStatus;
      }

      const result = await getAllBookings({
        page,
        limit: 10,
        search: debouncedSearch,
        sortBy: sortOrder,
        status: finalStatus,
        categoryId: filterCategory || undefined, 
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      });

      setItems(result.data || []);
      setTotal(result.total);
      setTotalPages(result.totalPages);

    } catch {
      // showError("Failed to load bookings."); // Optional: silence errors for socket updates
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, sortOrder, isHistory, filterStatus, filterCategory, startDate, endDate]); 

 
  useEffect(() => {
    const handleSocketUpdate = (event: AdminUpdateEvent) => {
        if (event.type === "ADMIN_NEW_BOOKING" || event.type === "NEW_BOOKING") {
             fetchBookings();
             return;
        }

        if (event.status && event.bookingId) {
             setItems(prevItems => prevItems.map(item => {
                 if (item.id === event.bookingId) {
                     return { ...item, status: event.status as BookingStatus };
                 }
                 return item;
             }));
        }
    };

    // 2. Register Listener
    socketService.onAdminDataUpdate(handleSocketUpdate);

    // 3. Cleanup: Remove ONLY this listener
    return () => {
        socketService.offAdminDataUpdate(handleSocketUpdate);
    };
  }, [fetchBookings]);

  // --- Helper: Options ---
  const getStatusOptions = () => {
    if (isHistory) {
      return ["COMPLETED", "PAID", "CANCELLED", "FAILED_ASSIGNMENT" ];
    }
    return ["REQUESTED", "ASSIGNED_PENDING", "ACCEPTED", "EN_ROUTE", "REACHED", "IN_PROGRESS", "EXTRAS_PENDING"];
  };



  // --- Helper: Status Badges ---
  const renderStatusBadge = (status: string) => {
    const s = status.replace(/_/g, " ");
    let colorClass = "bg-gray-100 text-gray-700 border-gray-200";
    let Icon = Clock;

    if (["COMPLETED", "PAID"].includes(status)) {
      colorClass = "bg-green-50 text-green-700 border-green-200";
      Icon = CheckCircle2;
    } else if (["CANCELLED", "FAILED_ASSIGNMENT", "TIMEOUT", "CANCELLED_BY_TECH", "REJECTED"].includes(status)) {
      colorClass = "bg-red-50 text-red-700 border-red-200";
      Icon = XCircle;
    } else if (["IN_PROGRESS", "ACCEPTED", "EN_ROUTE"].includes(status)) {
      colorClass = "bg-blue-50 text-blue-700 border-blue-200 animate-pulse";
      Icon = Briefcase;
    } else if (status === "REQUESTED") {
      colorClass = "bg-orange-50 text-orange-700 border-orange-200 animate-pulse";
      Icon = AlertCircle;
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
        <Icon size={12} />
        {s}
      </span>
    );
  };

  const hasActiveFilters = filterStatus || filterCategory || startDate || endDate;

  return (
    <div className="h-full flex flex-col gap-4 sm:gap-6 overflow-hidden bg-gray-50/30">

      {/* 1. HEADER (Identical to Verification Queue) */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end shrink-0 border-b border-gray-200 pb-4 gap-4 sm:gap-0 bg-white px-4 pt-4 sm:px-0 sm:pt-0 sm:bg-transparent">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <CalendarClock className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" />
            {pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {pageSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
           {/* Filters Toggle Button */}
           <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs sm:text-sm font-bold transition-all shadow-sm ${
                showFilters || hasActiveFilters ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter size={14} />
            <span>Filters</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blue-600"></span>}
          </button>

           <button
            onClick={() => setSortOrder(prev => prev === "newest" ? "oldest" : "newest")}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
          >
            <ArrowUpDown size={14} className={`text-gray-500 ${sortOrder === "newest" ? "" : "rotate-180"} transition-transform`} />
            <span>{sortOrder === "newest" ? "Newest" : "Oldest"}</span>
          </button>
          
          <button
            onClick={fetchBookings}
            disabled={loading}
            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? "animate-spin text-blue-600" : ""} />
          </button>

          <div className="ml-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold border border-blue-100 flex items-center gap-2">
            <Clock size={16} />
            <span>{total} Total</span>
          </div>
        </div>
      </div>

      {/* 2. FILTERS CONTAINER */}
      <div className="flex flex-col gap-3 px-4 sm:px-0">
          
          {/* A. Collapsible Advanced Filters Row */}
          {(showFilters || hasActiveFilters) && (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-fade-in-down">
                
                {/* 1. Status Filter */}
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Status</label>
                    <div className="relative">
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 appearance-none"
                        >
                            <option value="">All {isHistory ? "History" : "Live"}</option>
                            {getStatusOptions().map(s => (
                                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                            ))}
                        </select>
                        <ChevronRight className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 rotate-90 pointer-events-none"/>
                    </div>
                </div>

                {/* 2. Category Filter (  ADDED) */}
                <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Category</label>
        <div className="relative">
             <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 appearance-none"
            >
                <option value="">All Services</option>
                
                {/* 4. Map the Real Data */}
                {categories.map(c => (
                    // Note: Ensure 'c.id' or 'c._id' matches your ServiceCategory type
                    <option key={c.id  } value={c.id }> 
                        {c.name}
                    </option>
                ))}
            </select>
                        <Layers className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none"/>
                        <ChevronRight className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 rotate-90 pointer-events-none"/>
                    </div>
                </div>

                {/* 3. Start Date */}
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">From Date</label>
                    <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                
                {/* 4. End Date */}
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">To Date</label>
                    <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                 {/* 5. Clear Button */}
                 <div className="flex items-end">
                    <button 
                        onClick={() => {
                            setFilterStatus(""); setFilterCategory(""); setStartDate(""); setEndDate("");
                        }}
                        disabled={!hasActiveFilters}
                        className="w-full py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100 transition-colors text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X size={14} /> Clear All
                    </button>
                </div>
             </div>
          )}

          {/* B. Reusable Search Bar (Reused as requested) */}
          <SearchFilterBar 
             search={search}
             onSearchChange={(val) => { setSearch(val); setPage(1); }}
             searchPlaceholder="Search by Booking ID, Customer Name, or Service..."
             onClear={() => setSearch("")}
             totalItems={total}
             currentCount={items.length}
             itemName="Bookings"
          />
      </div>

      {/* 3. LIST CONTENT */}
      <div className="flex-1 overflow-hidden bg-white sm:rounded-2xl sm:shadow-sm sm:border border-gray-200 flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <LoaderFallback />
            <p className="text-sm font-medium">Syncing Bookings...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3 min-h-[300px]">
            <CalendarClock size={48} className="text-gray-200" />
            <p className="text-lg font-semibold text-gray-500">No Bookings Found</p>
            <p className="text-sm">Try adjusting your filters or search.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">

            {/* HEADER */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 font-bold text-xs text-gray-500 uppercase tracking-wider sticky top-0 z-10">
              <div className="col-span-4">Service & Customer</div>
              <div className="col-span-3">Technician</div>
              <div className="col-span-2">Date & Price</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {/* ROWS */}
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="group hover:bg-blue-50/30 transition-colors p-4 md:px-6 md:py-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                  {/* 1. Service & Customer */}
                  <div className="col-span-1 md:col-span-4 flex items-start gap-3">
                     <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold shrink-0 border border-blue-100">
                        {item.snapshots.service.name.charAt(0)}
                     </div>
                     <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{item.snapshots.service.name}</p>
                        <p className="text-xs text-gray-400 font-mono mb-1">#{item.id.slice(-6).toUpperCase()}</p>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                           <User size={12} />
                           <span className="truncate">{item.snapshots.customer.name}</span>
                        </div>
                     </div>
                  </div>

                  {/* 2. Technician */}
                  <div className="col-span-1 md:col-span-3">
                     {item.snapshots.technician ? (
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                              {item.snapshots.technician.avatarUrl ? (
                                 <img src={item.snapshots.technician.avatarUrl} alt="Tech" className="w-full h-full object-cover" />
                              ) : (
                                 <User size={12} className="text-gray-500"/>
                              )}
                           </div>
                           <span className="text-sm font-medium text-gray-700 truncate">{item.snapshots.technician.name}</span>
                        </div>
                     ) : (
                        <span className="text-xs text-gray-400 italic flex items-center gap-1">
                           <AlertCircle size={12} /> Unassigned
                        </span>
                     )}
                     <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <MapPin size={10} />
                        <span className="truncate max-w-[150px]">{item.location.address}</span>
                     </div>
                  </div>

                  {/* 3. Date & Price */}
                  <div className="col-span-1 md:col-span-2">
                     <p className="text-sm font-bold text-gray-900 flex items-center">
                        <IndianRupee size={12} />
                        {item.pricing.final || item.pricing.estimated}
                     </p>
                     <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(item.timestamps.createdAt), { addSuffix: true })} ago
                     </p>
                  </div>

                  {/* 4. Status */}
                  <div className="col-span-1 md:col-span-2">
                     {renderStatusBadge(item.status)}
                  </div>

                  {/* 5. Action */}
                  <div className="col-span-1 md:col-span-1 flex justify-end">
                    <button
                      onClick={() => navigate(`/admin/bookings/${item.id}`)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="View Booking Details"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. REUSABLE PAGINATION */}
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

export default AdminBookingsPage;