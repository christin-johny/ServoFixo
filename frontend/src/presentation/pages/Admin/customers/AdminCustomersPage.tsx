import React, { useEffect, useState, useCallback } from "react";
import { User,  Eye, Edit, ToggleRight, ToggleLeft, Mail, Phone } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import * as customerService from "../../../../infrastructure/repositories/admin/customerService"; 
import type { CustomerDto, CustomerUpdatePayload } from "../../../../domain/types/AdminCustomerDtos"; 
import { useNotification } from "../../../hooks/useNotification";
import { useDebounce } from "../../../hooks/useDebounce";
import CustomerEditModal from "../../../components/Admin/customer/CustomerEditModal";
import { SearchFilterBar, PaginationBar } from "../../../components/Admin/Shared/DataTableControls";
import { DataTable, type TableColumn } from "../../../components/Admin/Shared/DataTable"; // Import Generic Table
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
      setCustomers(prev => prev.map(c => c.id === customerToSuspend.id ? { ...c, suspended: newStatus } : c));
      setCustomerToSuspend(null); 
    } catch (err: unknown) { 
      const message = err instanceof Error ? err.message : "Failed to change account status.";
      showError(message);
    } finally {
      setIsSuspending(false);
    }
  };

  // --- COLUMN DEFINITIONS ---
  const columns: TableColumn<CustomerDto>[] = [
    {
      header: "Customer",
      render: (customer) => (
        <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                {customer.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
                <div className="text-sm font-bold text-gray-900">{customer.name}</div>
            </div>
        </div>
      )
    },
    {
      header: "Contact Info",
      render: (customer) => (
        <>
            <div className="text-sm text-gray-900">{customer.email}</div>
            <div className="text-xs text-gray-500">{customer.phone || 'No phone'}</div>
        </>
      )
    },
    {
        header: "Status",
        render: (customer) => (
            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full ${customer.suspended ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                {customer.suspended ? 'Suspended' : 'Active'}
            </span>
        )
    },
    {
        header: "Actions",
        className: "text-right",
        render: (customer) => (
            <div className="flex justify-end gap-1">
                <button onClick={() => navigate(`/admin/customers/${customer.id}`)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                <button onClick={() => handleStartEdit(customer)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleRequestStatusChange(customer)} title={customer.suspended ? "Activate" : "Suspend"} className={`p-2 rounded-lg transition-colors ${customer.suspended ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}>
                    {customer.suspended ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
            </div>
        )
    }
  ];

  return (
    <div className="flex flex-col h-full gap-4 sm:gap-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end shrink-0 border-b border-gray-200 pb-4 gap-4 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2"><User className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" /> Customer Management</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">View, search, and manage customer accounts and status.</p>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        <SearchFilterBar 
            search={search} onSearchChange={(val: string) => { setSearch(val); setPage(1); }} searchPlaceholder="Search customers..."
            filterStatus={filterStatus} onFilterChange={(val: string) => { setFilterStatus(val); setPage(1); }} onClear={handleClearFilters}
            filterOptions={[{ label: "Active", value: "false" }, { label: "Suspended", value: "true" }]}
            totalItems={totalCustomers} currentCount={customers.length} itemName="Customers"
        />

        <div className="flex-1 overflow-hidden">
            <DataTable 
                data={customers}
                columns={columns}
                keyField="id"
                isLoading={loading}
                emptyMessage="No customers found."
                renderMobileCard={(customer) => (
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-3 relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${customer.suspended ? 'bg-gray-300' : 'bg-green-500'}`} />
                        <div className="flex justify-between items-start pl-2">
                            <div>
                                <h3 className={`font-bold text-gray-900 ${customer.suspended ? 'text-gray-500' : ''}`}>{customer.name}</h3>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500"><Mail size={12} /> {customer.email}</div>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500"><Phone size={12} /> {customer.phone || 'N/A'}</div>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${customer.suspended ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                {customer.suspended ? 'SUSPENDED' : 'ACTIVE'}
                            </span>
                        </div>
                        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-50 pl-2">
                            <button onClick={() => handleRequestStatusChange(customer)} className={`p-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-colors ${customer.suspended ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                {customer.suspended ? <ToggleRight size={16} /> : <ToggleLeft size={16} />} {customer.suspended ? 'Activate' : 'Suspend'}
                            </button>
                            <button onClick={() => handleStartEdit(customer)} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Edit size={16} /></button>
                            <button onClick={() => navigate(`/admin/customers/${customer.id}`)} className="p-2 bg-gray-50 text-gray-600 rounded-lg"><Eye size={16} /></button>
                        </div>
                    </div>
                )}
            />
        </div>

        <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
      
      <CustomerEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} customerData={customerToEdit} onUpdateSuccess={() => { setIsEditModalOpen(false); loadCustomers(); }} />
      <ConfirmModal isOpen={!!customerToSuspend} onClose={() => setCustomerToSuspend(null)} onConfirm={handleConfirmStatusChange} title={customerToSuspend?.suspended ? "Activate Customer" : "Suspend Customer"} message={customerToSuspend?.suspended ? `Are you sure you want to reactivate ${customerToSuspend?.name}'s account?` : `Are you sure you want to suspend ${customerToSuspend?.name}?`} confirmText={customerToSuspend?.suspended ? "Activate" : "Suspend"} isLoading={isSuspending} />
    </div>
  );
};

export default AdminCustomersPage;