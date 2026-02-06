import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
    AlertCircle, Landmark, Briefcase, MapPin, 
    ArrowUpDown, RefreshCw, User, Calendar, Clock 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { useDebounce } from "../../../hooks/useDebounce";
import { useNotification } from "../../../hooks/useNotification";
import * as techRepo from "../../../../infrastructure/repositories/admin/technicianRepository";
import { SearchFilterBar, PaginationBar } from "../../../components/Shared/Table/DataTableControls";
import { DataTable, type TableColumn } from "../../../components/Shared/Table/DataTable";
import PartnerRequestResolutionModal from "../../../components/Admin/Modals/TechnicianRequestResolutionModal";
 
import type { TechnicianQueueItemDto } from "../../../../domain/types/TechnicianQueueDto";

type MaintenanceFilterType = "BANK" | "SERVICE" | "ZONE" | "";

const PartnerRequestQueue: React.FC = () => {
    const { showError, showSuccess } = useNotification();

    const [items, setItems] = useState<TechnicianQueueItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [filterStatus, setFilterStatus] = useState<MaintenanceFilterType>("");
    
    const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
    const [selectedTechId, setSelectedTechId] = useState<string | null>(null);

    const debouncedSearch = useDebounce(search, 500);

    const loadQueue = useCallback(async () => {
        try {
            setLoading(true);
            const result = await techRepo.getVerificationQueue({
                page,
                limit: 10,
                search: debouncedSearch,
                sort: sortOrder,
                sortBy: "updatedAt",
                type: "MAINTENANCE"
            });

            let filteredData = result.data || [];
            if (filterStatus) {
                filteredData = filteredData.filter((item: TechnicianQueueItemDto) => {
                    if (filterStatus === "BANK") return item.hasPendingBankRequests;
                    if (filterStatus === "SERVICE") return item.hasPendingServiceRequests;
                    if (filterStatus === "ZONE") return item.hasPendingZoneRequests;
                    return true;
                });
            }

            setItems(filteredData);
            setTotal(result.total);
            setTotalPages(result.totalPages);
        } catch (err: unknown) {
            showError(err instanceof Error ? err.message : "Failed to load queue");
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, sortOrder, filterStatus, showError]);

    useEffect(() => {
        loadQueue();
    }, [loadQueue]);

    const handleResolutionSuccess = useCallback((): void => {
        setResolutionModalOpen(false);
        setSelectedTechId(null);
        loadQueue();
        showSuccess("Maintenance request synchronized successfully");
    }, [loadQueue, showSuccess]);

    const columns: TableColumn<TechnicianQueueItemDto>[] = useMemo(() => [
        {
            header: "Technician",
            className: "w-full md:w-[30%] min-w-[250px]",
            render: (item: TechnicianQueueItemDto) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 shrink-0">
                        {item.avatarUrl ? (
                            <img src={item.avatarUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <User size={18} className="text-gray-400" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono uppercase truncate">ID: {item.id.slice(-8)}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Workflows",
            className: "hidden md:table-cell md:w-[30%]",
            render: (item: TechnicianQueueItemDto) => (
                <div className="flex flex-wrap gap-1.5">
                    {item.hasPendingBankRequests && <TicketBadge Icon={Landmark} label="Bank" color="orange" />}
                    {item.hasPendingServiceRequests && <TicketBadge Icon={Briefcase} label="Service" color="blue" />}
                    {item.hasPendingZoneRequests && <TicketBadge Icon={MapPin} label="Zone" color="purple" />}
                </div>
            )
        },
        {
            header: "Submission",
            className: "hidden md:table-cell md:w-[25%]",
            render: (item: TechnicianQueueItemDto) => (
                <div className="flex flex-col text-xs">
                    <span className="font-bold text-gray-700 flex items-center gap-1.5">
                        <Calendar size={12} className="text-gray-400" />
                        {item.submittedAt ? formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true }) : "--"}
                    </span>
                </div>
            )
        },
        {
            header: "Action",
            className: "text-right w-fit md:w-[15%]",
            render: (item: TechnicianQueueItemDto) => (
                <div className="flex justify-end">
                    <button
                        onClick={() => { setSelectedTechId(item.id); setResolutionModalOpen(true); }}
                        className="h-9 px-4 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap"
                    >
                        Review
                    </button>
                </div>
            )
        }
    ], []);

    return (
        <div className="h-full flex flex-col gap-4 md:gap-6 overflow-hidden bg-gray-50/30">
            {/* Responsive Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end shrink-0 border-b border-gray-200 pb-5 px-4 sm:px-0 gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <AlertCircle className="text-blue-600" size={28} />
                        Maintenance Hub
                    </h1>
                    <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">Audit and resolve technician profile update requests.</p>
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">
                    <button onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")} className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 shrink-0">
                        <ArrowUpDown size={18} className={sortOrder === "asc" ? "rotate-180" : ""} />
                        
                    </button>
                    <button onClick={loadQueue} className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:text-blue-600 shrink-0">
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                    <div className="bg-orange-50 text-orange-700 px-3 md:px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-bold border border-orange-100 flex items-center gap-2 shrink-0">
                        <Clock size={16} /> {total} PENDING
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-0">
                <SearchFilterBar
                    search={search}
                    onSearchChange={(val) => { setSearch(val); setPage(1); }}
                    searchPlaceholder="Filter by name..."
                    filterStatus={filterStatus}
                    onFilterChange={(val) => { setFilterStatus(val as MaintenanceFilterType); setPage(1); }}
                    onClear={() => { setSearch(""); setFilterStatus(""); }}
                    filterOptions={[
                        { label: "Bank Account", value: "BANK" },
                        { label: "New Service", value: "SERVICE" },
                        { label: "Zone Relocation", value: "ZONE" }
                    ]}
                    totalItems={total}
                    currentCount={items.length}
                    itemName="Requests"
                />
            </div>

            <div className="flex-1 overflow-hidden">
                <DataTable 
                    data={items} 
                    columns={columns} 
                    keyField="id" 
                    isLoading={loading} 
                    renderMobileCard={(item) => (
                        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm mb-3 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                        {item.avatarUrl ? <img src={item.avatarUrl} className="w-full h-full object-cover" /> : <User className="text-gray-400 m-2.5" size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-900">{item.name}</p>
                                        <p className="text-[10px] text-gray-400 font-mono">ID: {item.id.slice(-8).toUpperCase()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setSelectedTechId(item.id); setResolutionModalOpen(true); }}
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold"
                                >
                                    Review
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 py-1 border-t border-gray-50">
                                {item.hasPendingBankRequests && <TicketBadge Icon={Landmark} label="Bank" color="orange" />}
                                {item.hasPendingServiceRequests && <TicketBadge Icon={Briefcase} label="Service" color="blue" />}
                                {item.hasPendingZoneRequests && <TicketBadge Icon={MapPin} label="Zone" color="purple" />}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                <Calendar size={12} />
                                {item.submittedAt ? formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true }) : "--"}
                            </div>
                        </div>
                    )}
                />
            </div>

            <div className="bg-white border-t border-gray-200 sm:rounded-b-2xl">
                <PaginationBar page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            {resolutionModalOpen && selectedTechId && (
                <PartnerRequestResolutionModal 
                    isOpen={resolutionModalOpen} 
                    onClose={() => { setResolutionModalOpen(false); setSelectedTechId(null); }} 
                    technicianId={selectedTechId} 
                    onSuccess={handleResolutionSuccess} 
                />
            )}
        </div>
    );
};

interface TicketBadgeProps {
    Icon: React.ElementType;
    label: string;
    color: "orange" | "blue" | "purple";
}

const TicketBadge: React.FC<TicketBadgeProps> = ({ Icon, label, color }) => {
    const colorStyles = {
        orange: "bg-orange-50 text-orange-700 border-orange-100",
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        purple: "bg-purple-50 text-purple-700 border-purple-100"
    };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] md:text-[10px] font-bold uppercase border ${colorStyles[color]}`}>
            <Icon size={10} /> {label}
        </span>
    );
};

export default PartnerRequestQueue;