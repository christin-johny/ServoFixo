import React, { useEffect, useState } from "react";
import { Plus, Search, Layers, ChevronLeft, ChevronRight, RefreshCw, Filter } from "lucide-react";
import { useDebounce } from "../../../hooks/useDebounce";
import { useNotification } from "../../../hooks/useNotification";

import * as categoryRepo from "../../../../infrastructure/repositories/admin/serviceCategoryRepository";
import * as serviceRepo from "../../../../infrastructure/repositories/admin/serviceItemRepository";

import type { ServiceCategory } from "../../../../domain/types/ServiceCategory";
import type { ServiceItem } from "../../../../domain/types/ServiceItem";

import CategoryCard from "../../../components/Admin/category/CategoryCard";
import CategoryModal from "../../../components/Admin/category/CategoryModal";
import ServiceItemModal from "../../../components/Admin/Modals/ServiceItemModal";
import ConfirmModal from "../../../components/Admin/Modals/ConfirmModal";

const getErrorMessage = (error: any): string => {
    if (error.response && error.response.data) {
        return error.response.data.error || error.response.data.message || "Unknown server error";
    }
    return error.message || "Network error";
};

const Services: React.FC = () => {
    const { showSuccess, showError } = useNotification();

    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const debouncedSearch = useDebounce(search, 500);

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [servicesMap, setServicesMap] = useState<{ [key: string]: ServiceItem[] }>({});
    const [loadingServices, setLoadingServices] = useState(false);

    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);

    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<ServiceItem | null>(null);
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteType, setDeleteType] = useState<"CATEGORY" | "SERVICE" | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadCategories();
    }, [debouncedSearch, filterStatus, page]);

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

            if (result.data.length === 0 && page > 1) {
                setPage(1);
            }
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
            const result = await serviceRepo.getServices({ categoryId: catId, page: 1, limit: 100 });
            setServicesMap(prev => ({ ...prev, [catId]: result.data }));
        } catch (err) {
            showError("Failed to load services");
        } finally {
            setLoadingServices(false);
        }
    };

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

    const handleToggleCategoryStatus = async (e: React.MouseEvent, category: ServiceCategory) => {
        e.stopPropagation();
        try {
            const newStatus = !category.isActive;
            await categoryRepo.toggleCategoryStatus(category._id, newStatus);
            showSuccess(`Category ${category.name} is now ${newStatus ? 'Active' : 'Inactive'}`);
            loadCategories();
        } catch (err: any) {
            console.error(err);
            showError("Failed to update status. " + getErrorMessage(err));
        }
    };

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
            const msg = getErrorMessage(err);
            showError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleServiceStatus = async (service: ServiceItem) => {
        try {
            const newStatus = !service.isActive;
            await serviceRepo.toggleServiceStatus(service._id, newStatus);
            showSuccess(`Service ${service.name} is now ${newStatus ? 'Active' : 'Inactive'}`);
            if (expandedId) loadServicesForCategory(expandedId);
        } catch (err: any) {
            showError("Failed to update status");
        }
    };

    const confirmDeleteCategory = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
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
 
    const EmptyState = (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl bg-white/50 mx-1 flex flex-col items-center">
            <Layers className="text-gray-300 mb-4" size={40} />
            <h3 className="text-lg font-semibold text-gray-400 mb-1">
                {debouncedSearch || filterStatus ? "No Categories Match Your Filter" : "No Service Categories Found"}
            </h3>


        </div>
    ); 

    return (
        <div className="h-full flex flex-col gap-4 sm:gap-6 overflow-hidden">
            {/* Header & Filters (Unchanged) */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end shrink-0 border-b border-gray-200 pb-4 gap-4 sm:gap-0">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <Layers className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" /> Service Catalog
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage categories and service items.</p>
                </div>
                <button onClick={() => { setEditingCategory(null); setIsCatModalOpen(true); }} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-sm font-bold text-sm transition-colors">
                    <Plus size={18} /> New Category
                </button>
            </div>

            {/* Responsive Filter Bar (Unchanged) */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center shrink-0">

                {/* Search and Select Group */}
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1 max-w-3xl">

                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search categories..."
                            className="w-full pl-10 pr-4 h-10 sm:h-11 text-sm font-medium text-gray-700 placeholder:text-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/30 focus:bg-white transition-all"
                        />
                    </div>

                    {/* STATUS DROPDOWN WITH FILTER ICON */}
                    <div className="relative w-full sm:w-48 shrink-0">
                        <select
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                            className=" w-full h-10 sm:h-11 pl-4 pr-10 text-sm font-medium text-gray-700  bg-white border border-gray-200 rounded-xl  appearance-none  focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer transition-all hover:border-gray-300">
                            <option value="">All Status</option>
                            <option value="true">Active Only</option>
                            <option value="false">Inactive Only</option>
                        </select>

                        {/* Custom Filter Icon */}
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            <Filter size={16} />
                        </div>
                    </div>
                </div>

                {/* Total Count (Hidden on mobile to save space) */}
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest hidden md:block">
                    {total === 0 ? "No Categories" : `Showing ${categories.length} of ${total}`}
                </span>
            </div>

            {/* Content List Area */}
            <div className="flex-1 overflow-y-auto pr-1 -mr-1 pb-4 scrollbar-thin scrollbar-thumb-gray-200">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3"><RefreshCw size={32} className="animate-spin opacity-20" /><p className="text-sm font-medium">Loading...</p></div>
                ) : (
                    <>
                        {categories.length === 0 ? (
                            EmptyState
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {categories.map((cat) => (
                                    <CategoryCard
                                        key={cat._id}
                                        category={cat}
                                        isExpanded={expandedId === cat._id}
                                        onToggleExpand={() => setExpandedId(expandedId === cat._id ? null : cat._id)}
                                        onEdit={(e) => { e.stopPropagation(); setEditingCategory(cat); setIsCatModalOpen(true); }}
                                        onDelete={(e) => confirmDeleteCategory(e, cat._id)}
                                        onToggleStatus={(e) => handleToggleCategoryStatus(e, cat)}
                                        onToggleServiceStatus={handleToggleServiceStatus}
                                        services={servicesMap[cat._id] || []}
                                        isLoadingServices={expandedId === cat._id && loadingServices}
                                        onAddService={() => handleAddService(cat._id)}
                                        onEditService={handleEditService}
                                        onDeleteService={confirmDeleteService}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && categories.length > 0 && (  
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 shrink-0">
                    <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-1 px-3 sm:px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"><ChevronLeft size={16} /> <span className="hidden sm:inline">Previous</span></button>
                    <span className="text-xs sm:text-sm font-medium text-gray-500">Page {page} of {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="flex items-center gap-1 px-3 sm:px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 transition-colors"><span className="hidden sm:inline">Next</span> <ChevronRight size={16} /></button>
                </div>
            )}

            {/* Modals (Unchanged) */}
            <CategoryModal
                isOpen={isCatModalOpen} onClose={() => setIsCatModalOpen(false)}
                onSave={handleSaveCategory} initialData={editingCategory} isLoading={isSubmitting}
            />

            {activeCategoryId && (
                <ServiceItemModal
                    isOpen={isServiceModalOpen}
                    onClose={() => setIsServiceModalOpen(false)}
                    onSave={handleSaveService}
                    categoryId={activeCategoryId}
                    initialData={editingService}
                    isLoading={isSubmitting}
                />
            )}

            <ConfirmModal
                isOpen={!!deleteId} onClose={() => { setDeleteId(null); setDeleteType(null); }}
                onConfirm={executeDelete} isLoading={isDeleting}
                title={deleteType === "CATEGORY" ? "Delete Category" : "Delete Service"}
                message={deleteType === "CATEGORY" ? "Delete this category and all its services? (Archived)" : "Permanently delete this service item?"}
                confirmText="Delete"
            />
        </div>
    );
};

export default Services;