import React, { useEffect, useState, useCallback } from "react";
import { Landmark, IndianRupee,   Zap } from "lucide-react";
import { useNotification } from "../../notifications/hooks/useNotification";
import { useDebounce } from "../../../hooks/useDebounce";

import { SearchFilterBar, PaginationBar } from "../../../components/Table/DataTableControls";
import { DataTable, type TableColumn } from "../../../components/Table/DataTable";  
import ProcessPayoutModal from "../components/ProcessPayoutModal";

import { getPayouts, processPayout,triggerWeeklyBatch  } from "../api/adminPayoutRepository";
import type { AdminPayoutDto } from "../types/AdminPayoutTypes";
import ConfirmModal from "../../../components/Shared/ConfirmModal/ConfirmModal";

const AdminPayoutsPage: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  
  // State
  const [payouts, setPayouts] = useState<AdminPayoutDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("PENDING");
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  
  const debouncedSearch = useDebounce(search, 500);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<AdminPayoutDto | null>(null);

  const loadPayoutQueue = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getPayouts({
        page,
        limit: 10,
        search: debouncedSearch,
        status: filterStatus || undefined
      });
      
      // ADDED SAFETY FALLBACKS HERE
      setPayouts(result?.data || []);
      setTotalItems(result?.total || 0);
      setTotalPages(result?.totalPages || 1);
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load payout queue.";
      showError(message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterStatus, page, showError]);

  useEffect(() => {
    loadPayoutQueue();
  }, [loadPayoutQueue]);

  const handleClearFilters = () => {
    setSearch("");        
    setFilterStatus("");  
    setPage(1);           
  };

  const handleProcessClick = (payout: AdminPayoutDto) => {
    setSelectedPayout(payout);
    setIsModalOpen(true);
  };
 
  const handleTriggerBatch = async () => {
    setIsTriggering(true);
    try {
      await triggerWeeklyBatch();
      showSuccess("Payout batch generated successfully!");
      setIsTriggerModalOpen(false);
      setFilterStatus("PENDING"); // Force view to pending queue
      setPage(1);
      loadPayoutQueue(); // Refresh the table to show the new batch
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to trigger batch.";
      showError(message);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleConfirmPayout = async (id: string, referenceId: string) => {
    try { 
      await processPayout(id, { action: "APPROVE", referenceId });
      
      showSuccess(`Payout processed successfully. UTR: ${referenceId}`);
      setIsModalOpen(false);
      loadPayoutQueue(); 
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to process payout.";
      showError(message);
    }
  };

  // --- COLUMN DEFINITIONS ---
  const columns: TableColumn<AdminPayoutDto>[] = [
    {
      header: "Technician",
      render: (payout) => (
        <div className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm shrink-0">
                {payout.technicianName.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
                <div className="text-sm font-bold text-gray-900">{payout.technicianName}</div>
                <div className="text-xs text-gray-500">{payout.technicianPhone}</div>
            </div>
        </div>
      )
    },
    {
      header: "Amount Owed",
      render: (payout) => (
        <div className="flex flex-col">
            <span className="text-base font-black text-slate-900 flex items-center">
                <IndianRupee size={14} />{payout.amount.toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                {/* THE FIX: Use weekEnding instead of createdAt */}
                Batch: {new Date(payout.weekEnding || payout.createdAt).toLocaleDateString()}
            </span>
        </div>
      )
    },
    {
        header: "Bank Details",
        render: (payout) => (
            <div className="text-xs">
                <div className="font-bold text-gray-900">{payout.bankDetails.bankName}</div>
                <div className="font-mono text-gray-500 mt-0.5">A/C: {payout.bankDetails.accountNumber}</div>
            </div>
        )
    },
    {
        header: "Status",
        render: (payout) => (
            <span className={`px-2.5 py-1 inline-flex text-[10px] leading-4 font-black uppercase tracking-wider rounded-full border ${
                payout.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                payout.status === 'PENDING' ? 'bg-orange-50 text-orange-700 border-orange-200 animate-pulse' :
                'bg-gray-50 text-gray-700 border-gray-200'
            }`}>
                {payout.status}
            </span>
        )
    },
    {
        header: "Actions",
        className: "text-right",
        render: (payout) => (
            <div className="flex justify-end">
                {payout.status === 'PENDING' ? (
                    <button 
                        onClick={() => handleProcessClick(payout)} 
                        className="px-4 py-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold rounded-lg transition-colors border border-blue-100 hover:border-blue-600 shadow-sm"
                    >
                        Process Payout
                    </button>
                ) : (
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Paid On</p>
                        <p className="text-xs font-bold text-gray-900 mt-0.5">{new Date(payout.weekEnding || '').toLocaleDateString()}</p>
                    </div>
                )}
            </div>
        )
    }
  ] as TableColumn<AdminPayoutDto>[];

  return (
    <div className="flex flex-col h-full gap-4 sm:gap-6 overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end shrink-0 border-b border-gray-200 pb-4 gap-4 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Landmark className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" /> Payout Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Review weekly batches and process bank transfers.</p>
        </div>
        
        {/* ADDED THE TRIGGER BUTTON HERE */}
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsTriggerModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-sm font-bold text-blue-700 shadow-sm hover:bg-blue-100 transition-colors"
            >
                <Zap size={16} className="text-blue-600" /> Generate Batch
            </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        {/* FILTERS */}
        <SearchFilterBar 
            search={search} onSearchChange={(val: string) => { setSearch(val); setPage(1); }} searchPlaceholder="Search technician name..."
            filterStatus={filterStatus} onFilterChange={(val: string) => { setFilterStatus(val); setPage(1); }} onClear={handleClearFilters}
            filterOptions={[
                { label: "Pending Processing", value: "PENDING" }, 
                { label: "Approved", value: "APPROVED" }
            ]}
            totalItems={totalItems} currentCount={payouts.length} itemName="Payouts"
        />

        {/* DATA TABLE */}
        <div className="flex-1 overflow-hidden mt-4">
            <DataTable 
                data={payouts}
                columns={columns}
                keyField="id"
                isLoading={loading}
                emptyMessage={filterStatus === 'PENDING' ? "No pending payouts. All caught up!" : "No payouts found."}
                renderMobileCard={(payout) => (
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-3 relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${payout.status === 'APPROVED' ? 'bg-green-500' : 'bg-orange-400'}`} />
                        <div className="flex justify-between items-start pl-2">
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">{payout.technicianName}</h3>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">{payout.technicianPhone}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${payout.status === 'APPROVED' ? 'bg-emerald-50 text-green-600 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                                {payout.status}
                            </span>
                        </div>
                        <div className="mt-4 pl-2 flex justify-between items-end border-t border-gray-50 pt-3">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Amount</p>
                                <p className="text-lg font-black text-gray-900 flex items-center"><IndianRupee size={14}/> {payout.amount}</p>
                            </div>
                            {payout.status === 'PENDING' && (
                                <button 
                                    onClick={() => handleProcessClick(payout)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-sm"
                                >
                                    Process
                                </button>
                            )}
                        </div>
                    </div>
                )}
            />
        </div>

        {/* PAGINATION */}
        <div className="mt-2">
            <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
      
      {/* ACTION MODAL */}
      <ProcessPayoutModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        payout={selectedPayout} 
        onConfirm={handleConfirmPayout} 
      />
      <ConfirmModal 
        isOpen={isTriggerModalOpen} 
        onClose={() => setIsTriggerModalOpen(false)} 
        onConfirm={handleTriggerBatch} 
        title="Generate Payout Batch" 
        message="Are you sure you want to manually trigger the payout batch? This will scan all technicians and freeze eligible funds (₹500+) into pending payouts immediately." 
        confirmText="Generate Now" 
        isLoading={isTriggering} 
      />
    </div>
  );
};

export default AdminPayoutsPage;