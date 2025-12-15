import React, { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, User, RefreshCw, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as customerService from "../../../../infrastructure/repositories/admin/customerService"; 
import type { CustomerDto, CustomerUpdatePayload } from "../../../../domain/types/AdminCustomerDtos"; 
import { useNotification } from "../../../hooks/useNotification";
import { useDebounce } from "../../../hooks/useDebounce";
import CustomerEditModal from "../../../components/Admin/customer/CustomerEditModal";
import CustomerListTable from "../../../components/Admin/customer/CustomerListTable";

const AdminCustomersPage: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
 
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
 
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>(""); 
  const debouncedSearch = useDebounce(search, 500);
 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<CustomerDto | null>(null);

  useEffect(() => {
    loadCustomers();
  }, [debouncedSearch, filterStatus, page]);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const result = await customerService.getCustomers({
        page,
        limit: 10,
        search: debouncedSearch,
        suspended: filterStatus === "true" ? "true" : (filterStatus === "false" ? "false" : undefined)
      });
      
      setCustomers(result.data);
      setTotalCustomers(result.total);
      // @ts-ignore
      setTotalPages(Math.ceil(result.total / 10)); 
      
    } catch (err: any) {
      console.error(err);
      showError(err.message ?? "Failed to load customer list.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterStatus, page]);

  const handleStartEdit = (customer: CustomerDto) => {
    setCustomerToEdit(customer);
    setIsEditModalOpen(true);
  };
  
  const handleToggleStatus = async (customer: CustomerDto) => {
    const newStatus = !customer.suspended;
    try {
      const payload: CustomerUpdatePayload = {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        suspended: newStatus,
      };
      await customerService.updateCustomer(customer.id, payload);
      showSuccess(`Customer ${customer.name} was ${newStatus ? 'suspended' : 'activated'} successfully.`);
      await loadCustomers();
    } catch (err: any) {
      showError(err.message ?? "Failed to change account status.");
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 sm:gap-6 overflow-hidden">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end shrink-0 border-b border-gray-200 pb-4 gap-4 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <User className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" /> Customer Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">View, search, and manage customer accounts and status.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-h-0">
        
        {/* Filter Bar */}
        <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center shrink-0 mb-4">
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1 max-w-3xl">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search customers..."
                className="w-full pl-10 pr-4 h-10 sm:h-11 text-sm font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/30 focus:bg-white transition-all"
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative w-full sm:w-48 shrink-0">
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="w-full h-10 sm:h-11 pl-4 pr-10 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer hover:border-gray-300 transition-all"
              >
                <option value="">All Status</option>
                <option value="false">Active Only</option>
                <option value="true">Suspended Only</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:block">
            {totalCustomers === 0 ? "No Customers" : `Showing ${customers.length} of ${totalCustomers}`}
          </span>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto pr-1 pb-4 scrollbar-thin scrollbar-thumb-gray-200">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-3">
              <RefreshCw className="animate-spin opacity-20" size={32} />
              <p className="text-sm font-medium">Loading Customers...</p>
            </div>
          ) : (
            <CustomerListTable 
                customers={customers} 
                onEdit={handleStartEdit} 
                onView={(customer) => navigate(`/admin/customers/${customer.id}`)} 
                onToggleStatus={handleToggleStatus}
            />
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0 rounded-b-xl">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="flex items-center gap-1 px-3 sm:px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={16} /> <span className="hidden sm:inline">Previous</span>
            </button>
            <span className="text-xs sm:text-sm font-medium text-gray-600">Page {page} of {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="flex items-center gap-1 px-3 sm:px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"
            >
              <span className="hidden sm:inline">Next</span> <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
      
      {/* Edit Modal */}
      <CustomerEditModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          customerData={customerToEdit}
          onUpdateSuccess={() => {
              setIsEditModalOpen(false);
              loadCustomers();
          }}
      />
    </div>
  );
};

export default AdminCustomersPage;