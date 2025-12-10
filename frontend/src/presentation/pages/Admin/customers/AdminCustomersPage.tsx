import React, { useEffect, useState, useCallback } from "react";
import {
  Search, Filter, ChevronLeft, ChevronRight,User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

// ⚠️ Ensure correct path for Customer API Service
import * as customerService from "../../../../infrastructure/repositories/admin/customerService"; 
import type { CustomerDto, PaginatedCustomersResult, CustomerUpdatePayload } from "../../../../domain/types/AdminCustomerDtos"; 

// ⚠️ Assuming correct paths for hooks/components
import { useNotification } from "../../../hooks/useNotification";
import { useDebounce } from "../../../hooks/useDebounce";
import CustomerEditModal from "../../../components/Admin/customer/CustomerEditModal";
import CustomerListTable from "../../../components/Admin/customer/CustomerListTable";
const customerNameSchema = z.string().trim().min(3, { message: "Name must be at least 3 characters long." });

// --- MAIN COMPONENT ---
const AdminCustomersPage: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  // --- Data State (Matches Zones Page) ---
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // --- Filter & Pagination State (Matches Zones Page) ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  // Filter status: "" = All, "true" = Suspended, "false" = Active
  const [filterStatus, setFilterStatus] = useState<string>(""); 
  const debouncedSearch = useDebounce(search, 500);

  // --- UI State ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<CustomerDto | null>(null);
  
  // Note: No 'isCreating' state is needed as creation is de-prioritized.
  // Note: No delete state is implemented yet as it was not confirmed.
  
  // --- Form State (Used internally by the Modal) ---
  // The Modal component will handle its own form state based on customerToEdit
  

  // ✅ Trigger Fetch on Filters Change (Matches Zones Page)
  useEffect(() => {
    loadCustomers();
  }, [debouncedSearch, filterStatus, page]);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const result = await customerService.getCustomers({
        page,
        limit: 10, // Increased limit for typical list view (adjustable)
        search: debouncedSearch,
        // Backend expects 'true' or 'false' string for suspended status
        suspended: filterStatus === "true" ? "true" : (filterStatus === "false" ? "false" : undefined)
      });
      
      setCustomers(result.data);
      setTotalCustomers(result.total);
      // @ts-ignore - Assuming totalPages or similar logic is returned/calculated
      setTotalPages(Math.ceil(result.total / 10)); // Calculate pages based on your limit
      
    } catch (err: any) {
      console.error(err);
      showError(err.message ?? "Failed to load customer list.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterStatus, page]);


  // --- Handlers ---
  
  // 1. Open Edit Modal (used by the List Item)
  const handleStartEdit = (customer: CustomerDto) => {
    setCustomerToEdit(customer);
    setIsEditModalOpen(true);
  };
  
  // 2. Quick Status Toggle (used by the List Item)
  const handleToggleStatus = async (customer: CustomerDto) => {
    const newStatus = !customer.suspended;
    
    try {
      // Use the service's update function (sends PUT request)
      const payload: CustomerUpdatePayload = {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        suspended: newStatus,
      };
      
      await customerService.updateCustomer(customer.id, payload);
      
      showSuccess(`Customer ${customer.name} was ${newStatus ? 'suspended' : 'activated'} successfully.`);
      await loadCustomers(); // Reload data to reflect change
      
    } catch (err: any) {
      showError(err.message ?? "Failed to change account status.");
    }
  };


  // --- RENDERING ---
  return (
    <div className="flex flex-col h-full gap-6 overflow-y-auto pr-1 pb-4">

      {/* Header (Matches Zones Page) */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end shrink-0 border-b border-gray-200 pb-4 gap-4 sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <User className="text-indigo-600" />  Customer Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">View, search, and manage customer accounts and status.</p>
        </div>

        {/* Note: Creation is de-prioritized. Keeping button as placeholder if needed later */}
        {/* <button className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition-all text-sm font-semibold w-full sm:w-auto">
          <Plus size={18} /> Add New Customer
        </button> */}
      </div>

      {/* Main Content Area: Single Panel (List) */}
      <div className={`
        bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-auto lg:h-full lg:min-h-0 overflow-hidden
        animate-in fade-in duration-200
      `}>
        
        {/* Search & Filter Header (Matches Zones Page) */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-lg">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-9 pr-3 h-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="h-9 pl-3 pr-8 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
              >
                <option value="">All</option>
                <option value="false">Active</option>
                <option value="true">Suspended</option>
              </select>
              <Filter size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              {totalCustomers === 0 ? "No Customers Found" : `Showing ${customers.length} of ${totalCustomers}`}
            </span>
          </div>
        </div>

        {/* Scrollable List / Table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm p-8">Loading Customer Data...</div>
          ) : customers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
              <User size={32} className="mb-2 opacity-30" />
              <p className="text-sm font-medium">No customers match your search or filters.</p>
            </div>
          ) : (
            /* We render the Table Component here */
            <CustomerListTable 
                customers={customers}
                // Hook up the table actions to the main page handlers
                onEdit={handleStartEdit} 
                onView={(customer) => navigate(`/admin/customers/${customer.id}`)}
                onToggleStatus={handleToggleStatus}
            />
          )}
        </div>

        {/* Pagination Footer (Matches Zones Page) */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
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
      
      {/* Edit Modal (Hooked up here) */}
      <CustomerEditModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          customerData={customerToEdit}
          onUpdateSuccess={() => {
              setIsEditModalOpen(false);
              loadCustomers(); // Reload data after successful update
          }}
      />
    </div>
  );
};

export default AdminCustomersPage;