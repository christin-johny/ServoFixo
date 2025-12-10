import React, { useEffect, useState } from "react";
import { Plus, Search, Filter, Layers, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useDebounce } from "../../../hooks/useDebounce";
import { useNotification } from "../../../hooks/useNotification";

// Repositories
import * as categoryRepo from "../../../../infrastructure/repositories/admin/serviceCategoryRepository";
import * as serviceRepo from "../../../../infrastructure/repositories/admin/serviceItemRepository";

// Types
import type { ServiceCategory } from "../../../../domain/types/ServiceCategory";
import type { ServiceItem } from "../../../../domain/types/ServiceItem";

// Components
import CategoryCard from "../../../components/Admin/category/CategoryCard";
import CategoryModal from "../../../components/Admin/category/CategoryModal";
import ServiceItemModal from "../../../components/Admin/Modals/ServiceItemModal";
import ConfirmModal from "../../../components/Admin/Modals/ConfirmModal";

// Helper to extract the exact message from Backend
const getErrorMessage = (error: any): string => {
  if (error.response && error.response.data) {
    // Check for "error" key (standard) or "message" key (sometimes used)
    return error.response.data.error || error.response.data.message || "Unknown server error";
  }
  return error.message || "Network error";
};


const Services: React.FC = () => {
    const { showSuccess, showError } = useNotification();

    // --- Category State ---
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const debouncedSearch = useDebounce(search, 500);

    // --- Service Item State (For the Expanded View) ---
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [servicesMap, setServicesMap] = useState<{ [key: string]: ServiceItem[] }>({}); // Cache services by categoryId
    const [loadingServices, setLoadingServices] = useState(false);

    // --- Modal State ---
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);

    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false); // ✅ Service Modal
    const [editingService, setEditingService] = useState<ServiceItem | null>(null); // ✅ Edit Service
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null); // ✅ Which category are we adding to?

    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Delete State ---
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteType, setDeleteType] = useState<"CATEGORY" | "SERVICE" | null>(null); // ✅ Track what we are deleting
    const [isDeleting, setIsDeleting] = useState(false);

    
    // 1. Load Categories
    useEffect(() => {
        loadCategories();
    }, [debouncedSearch, filterStatus, page]);

    // 2. Load Services when Expanded
    useEffect(() => {
        if (expandedId && !servicesMap[expandedId]) {
            loadServicesForCategory(expandedId);
        }
    }, [expandedId]);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const result = await categoryRepo.getCategories({
                page, limit: 4, search: debouncedSearch, isActive: filterStatus
            });
            setCategories(result.data);
            setTotal(result.total);
            setTotalPages(result.totalPages);
        } catch (err) {
            console.error(err);
            showError("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    const loadServicesForCategory = async (catId: string) => {
        try {
            setLoadingServices(true);
            // Fetch ALL services for this category (no pagination for sub-list for now)
            const result = await serviceRepo.getServices({ categoryId: catId, page: 1, limit: 100 });
            setServicesMap(prev => ({ ...prev, [catId]: result.data }));
        } catch (err) {
            showError("Failed to load services");
        } finally {
            setLoadingServices(false);
        }
    };

    // --- Handlers: Category ---
    const handleSaveCategory = async (formData: FormData) => {
        try {
            setIsSubmitting(true);
            if (editingCategory) {
                await categoryRepo.updateCategory(editingCategory._id, formData);
                showSuccess("Category updated");
            } else {
                await categoryRepo.createCategory(formData);
                showSuccess("Category created");
            }
            setIsCatModalOpen(false);
            loadCategories();
        } catch (err: any) {
            const msg = getErrorMessage(err);
            showError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Handlers: Service Item ---
    const handleAddService = (catId: string) => {
        setEditingService(null);
        setActiveCategoryId(catId);
        setIsServiceModalOpen(true);
    };

    const handleEditService = (service: ServiceItem) => {
        setEditingService(service);
        setActiveCategoryId(service.categoryId);
        setIsServiceModalOpen(true);
    };

const handleSaveService = async (formData: FormData) => {
        try {
            setIsSubmitting(true);
            if (editingService) {
                await serviceRepo.updateService(editingService._id, formData);
                showSuccess("Service updated successfully");
            } else {
                await serviceRepo.createService(formData);
                showSuccess("Service item added successfully");
            }
            
            setIsServiceModalOpen(false);
            if (activeCategoryId) loadServicesForCategory(activeCategoryId);
        } catch (err: any) {
            // ✅ USE THE HELPER HERE
            const msg = getErrorMessage(err);
            showError(msg); 
        } finally {
            setIsSubmitting(false);
        }
    };
    // --- Handlers: Delete ---
    const confirmDeleteCategory = (id: string) => {
        setDeleteId(id);
        setDeleteType("CATEGORY");
    };

    const confirmDeleteService = (id: string) => {
        setDeleteId(id);
        setDeleteType("SERVICE");
    };

    const executeDelete = async () => {
        if (!deleteId || !deleteType) return;
        try {
            setIsDeleting(true);

            if (deleteType === "CATEGORY") {
                await categoryRepo.deleteCategory(deleteId);
                showSuccess("Category deleted");
                if (categories.length === 1 && page > 1) setPage(p => p - 1);
                else loadCategories();
            } else {
                await serviceRepo.deleteService(deleteId);
                showSuccess("Service deleted");
                // Refresh the list of the currently expanded category
                if (expandedId) loadServicesForCategory(expandedId);
            }
            setDeleteId(null);
            setDeleteType(null);
        } catch (err: any) {
            showError(err.response?.data?.error || "Failed to delete");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="h-full flex flex-col gap-6 overflow-hidden">
            {/* Header & Filters (Same as before) */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end shrink-0 border-b border-gray-200 pb-4 gap-4 sm:gap-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Layers className="text-blue-600" /> Service Catalog
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manage categories and service items.</p>
                </div>
                <button onClick={() => { setEditingCategory(null); setIsCatModalOpen(true); }} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm font-bold text-sm">
                    <Plus size={18} /> New Category
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0">
                <div className="flex gap-3 w-full sm:w-auto flex-1 max-w-2xl">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search categories..."
                            className="w-full pl-10 pr-4 h-11 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:blue-500 bg-gray-50/50 focus:bg-white"
                        />
                    </div>
                    <div className="relative w-40 shrink-0">
                        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="w-full h-11 pl-4 pr-10 text-sm border border-gray-200 rounded-xl bg-gray-50/50 appearance-none cursor-pointer">
                            <option value="">All Status</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                        <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
                    {total === 0 ? "No Categories" : `Showing ${categories.length} of ${total}`}
                </span>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto pr-1 -mr-1 pb-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3"><RefreshCw size={32} className="animate-spin opacity-20" /><p className="text-sm font-medium">Loading...</p></div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {categories.map((cat) => (
                            <CategoryCard
                                key={cat._id}
                                category={cat}
                                isExpanded={expandedId === cat._id}
                                onToggleExpand={() => setExpandedId(expandedId === cat._id ? null : cat._id)}
                                onEdit={() => { setEditingCategory(cat); setIsCatModalOpen(true); }}
                                onDelete={() => confirmDeleteCategory(cat._id)}

                                // ✅ Props for Sub-Services
                                services={servicesMap[cat._id] || []}
                                isLoadingServices={expandedId === cat._id && loadingServices}
                                onAddService={() => handleAddService(cat._id)}
                                onEditService={handleEditService}
                                onDeleteService={confirmDeleteService}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination Footer (Same as before) */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 shrink-0">
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"><ChevronLeft size={16} /> Previous</button>
                    <span className="text-sm font-medium text-gray-500">Page {page} of {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50">Next <ChevronRight size={16} /></button>
                </div>
            )}

            {/* --- Modals --- */}
            <CategoryModal
                isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)}
                onSave={handleSaveCategory} initialData={editingCategory} isLoading={isSubmitting}
            />

            {/* ✅ New Service Modal */}
            {activeCategoryId && (
                <ServiceItemModal
                    isOpen={isServiceModalOpen}
                    onClose={() => setIsServiceModalOpen(false)}
                    onSave={handleSaveService}
                    categoryId={activeCategoryId}
                    initialData={editingService} // <--- Crucial for Edit Mode
                    isLoading={isSubmitting}
                />
            )}

            <ConfirmModal
                isOpen={!!deleteId} onClose={() => { setDeleteId(null); setDeleteType(null); }}
                onConfirm={executeDelete} isLoading={isDeleting}
                title={deleteType === "CATEGORY" ? "Delete Category" : "Delete Service"}
                message={deleteType === "CATEGORY" ? "Delete this category and all its services?" : "Permanently delete this service item?"}
                confirmText="Delete"
            />
        </div>
    );
};

export default Services;