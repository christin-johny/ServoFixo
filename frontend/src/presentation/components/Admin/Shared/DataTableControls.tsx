import React from "react";
import { Search, Filter, ChevronLeft, ChevronRight, X } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface DataTableControlsProps {
  search: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  filterStatus?: string;
  onFilterChange?: (val: string) => void;
  filterOptions?: FilterOption[];
  onClear?: () => void;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;

  totalItems: number;
  currentCount: number;
  itemName?: string; 
}

export const SearchFilterBar: React.FC<Omit<DataTableControlsProps, 'page' | 'totalPages' | 'onPageChange'>> = ({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  filterStatus,
  onFilterChange,
  filterOptions = [
    { label: "Active Only", value: "true" },
    { label: "Inactive Only", value: "false" }
  ],
  onClear,
  totalItems,
  currentCount,
  itemName = "items"
}) => {
  const hasActiveFilter = search.length > 0 || (filterStatus && filterStatus !== "");

  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center shrink-0 mb-4">
      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1 max-w-3xl items-center">
        {/* Search */}
        <div className="relative flex-1 w-full sm:w-auto">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 h-10 sm:h-11 text-sm font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/30 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Dropdown */}
        {onFilterChange && (
          <div className="relative w-full sm:w-48 shrink-0">
            <select
              value={filterStatus}
              onChange={(e) => onFilterChange(e.target.value)}
              className="w-full h-10 sm:h-11 pl-4 pr-10 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer hover:border-gray-300 transition-all"
            >
              <option value="">All Status</option>
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <Filter size={16} className="opacity-50" />
            </div>
          </div>
        )}

        {/* 4. THE CLEAR BUTTON (Only shows if filters are active AND onClear is provided) */}
        {hasActiveFilter && onClear && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100 shrink-0"
            title="Clear all filters"
          >
            <X size={16} />
            <span >Clear</span>
          </button>
        )}
      </div>

      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:block">
        {totalItems === 0 ? `No ${itemName}` : `Showing ${currentCount} of ${totalItems}`}
      </span>
    </div>
  );
};

export const PaginationBar: React.FC<Pick<DataTableControlsProps, 'page' | 'totalPages' | 'onPageChange'>> = ({
  page,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="p-2 sm:p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0 rounded-b-xl">

      {/* 2. Reduced gap on mobile (gap-2) */}
      <div className="flex w-full sm:w-auto justify-between gap-2">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 h-9 px-3 sm:px-4 text-xs sm:text-sm font-bold text-gray-600 bg-white border border-gray-200 sm:border-transparent sm:bg-transparent hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
          <span>Previous</span>
        </button>

        {/* Mobile Page Indicator: Compact text */}
        <span className="sm:hidden flex items-center justify-center text-xs font-bold text-gray-500 bg-white px-2 border border-gray-200 rounded-lg h-9 min-w-[60px]">
          {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 h-9 px-3 sm:px-4 text-xs sm:text-sm font-bold text-gray-600 bg-white border border-gray-200 sm:border-transparent sm:bg-transparent hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span>Next</span>
          <ChevronRight size={14} className="sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Desktop Page Indicator (Unchanged) */}
      <span className="hidden sm:inline text-xs sm:text-sm font-medium text-gray-500">
        Page <span className="font-bold text-gray-800">{page}</span> of {totalPages}
      </span>
    </div>
  );
};