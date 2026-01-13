import React, { useEffect, useState } from "react";
import { 
    ClipboardList, AlertCircle, Landmark, Briefcase, MapPin, 
    ArrowUpDown, RefreshCw, User, Calendar 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { useDebounce } from "../../../hooks/useDebounce";
import { useNotification } from "../../../hooks/useNotification";
import * as techRepo from "../../../../infrastructure/repositories/admin/technicianRepository";
import { SearchFilterBar, PaginationBar } from "../../../components/Admin/Shared/DataTableControls";
import { DataTable, type TableColumn } from "../../../components/Admin/Shared/DataTable";
import PartnerRequestResolutionModal from "../../../components/Admin/Modals/TechnicianRequestResolutionModal";
 
import type { TechnicianQueueItemDto } from "../../../../domain/types/TechnicianQueueDto";

const PartnerRequestQueue: React.FC = () => {
    const { showError, showSuccess } = useNotification();

    const [items, setItems] = useState<TechnicianQueueItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    
    const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
    const [selectedTechId, setSelectedTechId] = useState<string | null>(null);

    const debouncedSearch = useDebounce(search, 500);

    const loadQueue = async () => {
        try {
            setLoading(true);
            const result = await techRepo.getVerificationQueue({
                page,
                limit: 10,
                search: debouncedSearch,
                sort: sortOrder,
                sortBy: "updatedAt"
            });

            setItems(result.data || []);
            setTotal(result.total);
            setTotalPages(result.totalPages);
        } catch  {
            showError("Failed to load partner requests queue");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQueue();
    }, [debouncedSearch, page, sortOrder]);

    const handleOpenResolution = (id: string) => {
        setSelectedTechId(id);
        setResolutionModalOpen(true);
    };

    const handleResolutionSuccess = () => {
        setResolutionModalOpen(false);
        setSelectedTechId(null);
        loadQueue();
        showSuccess("Partner request resolved successfully");
    };

    const columns: TableColumn<TechnicianQueueItemDto>[] = [
        {
            header: "Technician",
            className: "w-[30%] min-w-[250px]",
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                        {item.avatarUrl ? (
                            <img src={item.avatarUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <User size={20} className="text-gray-400" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 font-mono">ID: {item.id.slice(-6)}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Request Types",
            className: "w-[30%]",
            render: (item) => (
                <div className="flex flex-wrap gap-2">
                    {item.hasPendingBankRequests && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-100">
                            <Landmark size={12} /> BANK
                        </span>
                    )}
                    {item.hasPendingServiceRequests && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            <Briefcase size={12} /> SERVICE
                        </span>
                    )}
                    {item.hasPendingZoneRequests && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                            <MapPin size={12} /> ZONE
                        </span>
                    )}
                </div>
            )
        },
        {
            header: "Submitted",
            className: "w-[25%]",
            render: (item) => (
                <div className="flex flex-col">
                    <span className="text-sm text-gray-700 font-medium flex items-center gap-1.5">
                        <Calendar size={14} className="text-gray-400" />
                        {item.submittedAt ? formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true }) : "--"}
                    </span>
                    <span className="text-[11px] text-gray-400 ml-5">
                        {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : ""}
                    </span>
                </div>
            )
        },
        {
            header: "Action",
            className: "text-right w-[15%]",
            render: (item) => (
                <button
                    onClick={() => handleOpenResolution(item.id)}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-100"
                >
                    <ClipboardList size={14} /> Review
                </button>
            )
        }
    ];

    return (
        <div className="h-full flex flex-col gap-4 sm:gap-6 overflow-hidden bg-gray-50/30">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end shrink-0 border-b border-gray-200 pb-4 gap-4 sm:gap-0 bg-white px-4 pt-4 sm:px-0 sm:pt-0 sm:bg-transparent">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <AlertCircle className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" />
                        Maintenance Queue
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Review partner updates for bank details, services, and zones.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm"
                    >
                        <ArrowUpDown size={14} className={sortOrder === "asc" ? "rotate-180" : ""} />
                        <span>{sortOrder === "asc" ? "Oldest First" : "Newest First"}</span>
                    </button>
                    <button onClick={loadQueue} disabled={loading} className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-blue-600 shadow-sm">
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>
            <div className="px-4 sm:px-0">
                <SearchFilterBar
                    search={search} onSearchChange={(val) => { setSearch(val); setPage(1); }} searchPlaceholder="Search by technician name..." 
                    onClear={() => setSearch("")} totalItems={total} currentCount={items.length} itemName="Requests"
                />
            </div>
            <div className="flex-1 overflow-hidden">
                <DataTable data={items} columns={columns} keyField="id" isLoading={loading} emptyMessage="No pending maintenance requests found." />
            </div>
            <div className="bg-white z-10 relative border-t border-gray-200">
                <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
            {selectedTechId && (
                <PartnerRequestResolutionModal isOpen={resolutionModalOpen} onClose={() => { setResolutionModalOpen(false); setSelectedTechId(null); }} technicianId={selectedTechId} onSuccess={handleResolutionSuccess} />
            )}
        </div>
    );
};

export default PartnerRequestQueue;