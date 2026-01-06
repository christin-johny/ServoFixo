import React, { useEffect, useState, useCallback } from "react";
import { User, RefreshCw } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import * as customerService from "../../../../infrastructure/repositories/admin/customerService"; 
import type { CustomerDto, CustomerUpdatePayload } from "../../../../domain/types/AdminCustomerDtos"; 
import { useNotification } from "../../../hooks/useNotification";
import { useDebounce } from "../../../hooks/useDebounce";
import CustomerEditModal from "../../../components/Admin/customer/CustomerEditModal";
import CustomerListTable from "../../../components/Admin/customer/CustomerListTable";
import { SearchFilterBar, PaginationBar } from "../../../components/Admin/Shared/DataTableControls";
import ConfirmModal from "../../../components/Admin/Modals/ConfirmModal";

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
 
  const [customerToSuspend, setCustomerToSuspend] = useState<CustomerDto | null>(null);
  const [isSuspending, setIsSuspending] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, [debouncedSearch, filterStatus, page]);

  const handleClearFilters = () => {
    setSearch("");        
    setFilterStatus("");  
    setPage(1);           
  };

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const result = await customerService.getCustomers({
        page,
        limit: 7,
        search: debouncedSearch,
        suspended: filterStatus === "true" ? "true" : (filterStatus === "false" ? "false" : undefined)
      });
      
      setCustomers(result.data);
      setTotalCustomers(result.total);
       
      setTotalPages(Math.ceil(result.total / 7)); 
      
    } catch (err: unknown) {
      console.error(err); 
      const message = err instanceof Error ? err.message : "Failed to load customer list.";
      showError(message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterStatus, page, showSuccess, showError]);

  const handleStartEdit = (customer: CustomerDto) => {
    setCustomerToEdit(customer);
    setIsEditModalOpen(true);
  };
  
  const handleRequestStatusChange = (customer: CustomerDto) => {
    setCustomerToSuspend(customer);
  };

  const handleConfirmStatusChange = async () => {
    if (!customerToSuspend) return;

    setIsSuspending(true);
    const newStatus = !customerToSuspend.suspended;

    try {
      const payload: CustomerUpdatePayload = {
        name: customerToSuspend.name,
        email: customerToSuspend.email,
        phone: customerToSuspend.phone,
        suspended: newStatus,
      };

      await customerService.updateCustomer(customerToSuspend.id, payload);
      
      showSuccess(`Customer ${customerToSuspend.name} was ${newStatus ? 'suspended' : 'activated'} successfully.`);
      
      setCustomers(prev => prev.map(c => 
        c.id === customerToSuspend.id ? { ...c, suspended: newStatus } : c
      ));

      setCustomerToSuspend(null); 
    } catch (err: unknown) { 
      const message = err instanceof Error ? err.message : "Failed to change account status.";
      showError(message);
    } finally {
      setIsSuspending(false);
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
        
        {/* Search & Filters */}
        <SearchFilterBar 
            search={search}
            onSearchChange={(val: string) => { setSearch(val); setPage(1); }}
            searchPlaceholder="Search customers..."
            filterStatus={filterStatus}
            onFilterChange={(val: string) => { setFilterStatus(val); setPage(1); }}
            onClear={handleClearFilters}
            filterOptions={[
                { label: "Active", value: "false" }, 
                { label: "Suspended", value: "true" }
            ]}
            totalItems={totalCustomers}
            currentCount={customers.length}
            itemName="Customers"
        />

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
                onToggleStatus={handleRequestStatusChange}
            />
          )}
        </div>

        {/* Pagination */}
        <PaginationBar 
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
        />
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

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={!!customerToSuspend}
        onClose={() => setCustomerToSuspend(null)}
        onConfirm={handleConfirmStatusChange}
        title={customerToSuspend?.suspended ? "Activate Customer" : "Suspend Customer"}
        message={
            customerToSuspend?.suspended
                ? `Are you sure you want to reactivate ${customerToSuspend?.name}'s account? They will be able to login again.`
                : `Are you sure you want to suspend ${customerToSuspend?.name}? They will no longer be able to login.`
        }
        confirmText={customerToSuspend?.suspended ? "Activate" : "Suspend"}
        isLoading={isSuspending}
      />
    </div>
  );
};

export default AdminCustomersPage;